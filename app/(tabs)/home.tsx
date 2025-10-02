import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/backend/AuthContext';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { getCurrentRestaurantData } from '@/backend/services/userService';
import Loading from '@/components/Loading';

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'In behandeling', color: '#f59e42' },
  2: { label: 'Betaald', color: '#2563eb' },
  3: { label: 'Geleverd', color: '#22c55e' },
  5: { label: 'Geannuleerd', color: '#ef4444' },
};

const STATUS_OPTIONS = [
  { value: 1, label: 'In behandeling' },
  { value: 2, label: 'Betaald' },
  { value: 3, label: 'Geleverd' },
  { value: 4, label: 'Geannuleerd' },
];

interface OrderLine {
  id: number;
  products?: { productName: string; price: number };
  quantity: number;
  price: number;
  status: number; // <-- status per purchaseLine
  restaurantId: number; // <-- restaurantId per purchaseLine
}

interface Order {
  id: number;
  status: number;
  created_at: string;
  streetName?: string;
  houseNumber?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
  totalPrice?: number;
  deliveryNotes?: string;
  purchaseLine: OrderLine[];
}

export default function CreatorHome() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      setLoading(true);
      // Haal restaurant op
      const restRes = await getCurrentRestaurantData();
      if (!restRes.success || !restRes.data) {
        setRestaurant(null);
        setOrders([]);
        setLoading(false);
        return;
      }
      setRestaurant(restRes.data);
      // Haal bestellingen op voor dit restaurant
      const { data, error } = await supabase
        .from('purchaseLine')
        .select(`*, purchase:purchaseId(*), products:productId(productName, price)`)
        .eq('restaurantId', restRes.data.id)
        .order('created_at', { ascending: false });
      if (error) {
        setOrders([]);
      } else {
        // Groepeer per bestelling
        const grouped: Record<number, Order> = {};
        (data || []).forEach((line: any) => {
          const orderId = line.purchaseId;
          if (!grouped[orderId]) grouped[orderId] = { ...line.purchase, purchaseLine: [] };
          grouped[orderId].purchaseLine.push(line);
        });
        setOrders(Object.values(grouped));
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user?.id]);

  // Pas status alleen aan voor purchaseLines van het eigen restaurant
  const updateOwnOrderLinesStatus = async (orderId: number, newStatus: number) => {
    if (!restaurant?.id) return;
    // 1. Update alleen de purchaseLines van dit restaurant
    const { error } = await supabase
      .from('purchaseLine')
      .update({ status: newStatus })
      .eq('purchaseId', orderId)
      .eq('restaurantId', restaurant.id);
    if (error) {
      Alert.alert('Fout', 'Kon status niet bijwerken.');
      return;
    }
    // 2. Update lokaal in de UI
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        purchaseLine: o.purchaseLine.map(l => l.restaurantId === restaurant.id ? { ...l, status: newStatus } : l)
      };
    }));
    setSelectedOrder(prev => prev && prev.id === orderId ? {
      ...prev,
      purchaseLine: prev.purchaseLine.map(l => l.restaurantId === restaurant.id ? { ...l, status: newStatus } : l)
    } : prev);
    // 3. Check of ALLE purchaseLines van deze bestelling nu dezelfde status hebben
    const { data: allLines, error: fetchError } = await supabase
      .from('purchaseLine')
      .select('status')
      .eq('purchaseId', orderId);
    if (fetchError || !allLines) return;
    const allSame = allLines.length > 0 && allLines.every(l => l.status === newStatus);
    if (allSame) {
      // 4. Update de hoofdstatus van de purchase tabel
      await supabase
        .from('purchase')
        .update({ status: newStatus })
        .eq('id', orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    // Vind de bestelregels van het eigen restaurant
    const ownLines = item.purchaseLine.filter(l => l.restaurantId === restaurant?.id);
    let statusLabel = '';
    let statusColor = '#e5e7eb';
    if (ownLines.length === 0) {
      statusLabel = 'Geen producten';
      statusColor = '#e5e7eb';
    } else {
      const uniqueStatuses = Array.from(new Set(ownLines.map(l => l.status)));
      if (uniqueStatuses.length === 1) {
        statusLabel = STATUS_MAP[uniqueStatuses[0]]?.label || 'Onbekend';
        statusColor = STATUS_MAP[uniqueStatuses[0]]?.color || '#e5e7eb';
      } else {
        statusLabel = 'Meerdere statussen';
        statusColor = '#f59e42'; // oranje als waarschuwing
      }
    }
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedOrder(item);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.orderId}>#{item.id}</Text>
          <View style={{ backgroundColor: statusColor, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}</Text>
        <Text style={styles.total}>€{item.totalPrice?.toFixed(2) ?? '-'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 24, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Bestellingen</Text>
      </View>
      {loading ? (
         <View style={styles.loadingOverlay}>
         <Loading />
       </View>
      ) : orders.length === 0 ? (
        <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>Geen bestellingen gevonden.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id.toString()}
          renderItem={renderOrderCard}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
      {/* Modal voor details en status-wijziging */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Bestelling #{selectedOrder.id}</Text>
                <Text style={styles.modalLabel}>Status:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                  {(() => {
                    // Vind de status van de eigen bestelregel(s)
                    const ownLines = selectedOrder.purchaseLine.filter(l => l.restaurantId === restaurant?.id);
                    // Toon de status van de eerste eigen regel (of -1 als geen eigen regels)
                    const ownStatus = ownLines.length > 0 ? ownLines[0].status : -1;
                    return STATUS_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        style={{
                          backgroundColor: ownStatus === opt.value ? STATUS_MAP[opt.value].color : '#e5e7eb',
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                        onPress={() => updateOwnOrderLinesStatus(selectedOrder.id, opt.value)}
                        disabled={ownLines.length === 0}
                      >
                        <Text style={{ color: ownStatus === opt.value ? 'white' : '#333', fontWeight: 'bold' }}>{opt.label}</Text>
                      </TouchableOpacity>
                    ));
                  })()}
                </View>
                <Text style={styles.modalLabel}>Datum:</Text>
                <Text style={styles.modalValue}>{new Date(selectedOrder.created_at).toLocaleString()}</Text>
                <Text style={styles.modalLabel}>Adres:</Text>
                <Text style={styles.modalValue}>{[selectedOrder.streetName, selectedOrder.houseNumber, selectedOrder.zipCode, selectedOrder.city, selectedOrder.state, selectedOrder.country].filter(Boolean).join(' ')}</Text>
                <Text style={styles.modalLabel}>Totaal:</Text>
                <Text style={styles.modalValue}>€{selectedOrder.totalPrice?.toFixed(2) ?? '-'}</Text>
                {selectedOrder.deliveryNotes && (
                  <>
                    <Text style={styles.modalLabel}>Notities:</Text>
                    <Text style={styles.modalValue}>{selectedOrder.deliveryNotes}</Text>
                  </>
                )}
                <Text style={styles.modalLabel}>Producten:</Text>
                {selectedOrder.purchaseLine.map(line => (
                  <View key={line.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2, alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalValue}>{line.products?.productName || 'Product'} x{line.quantity}</Text>
                      <Text style={[styles.modalValue, { fontSize: 12, color: STATUS_MAP[line.status]?.color || '#888' }]}>Status: {STATUS_MAP[line.status]?.label || 'Onbekend'}</Text>
                    </View>
                    <Text style={styles.modalValue}>€{(line.price * line.quantity).toFixed(2)}</Text>
                  </View>
                ))}
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Sluiten</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 16,
    flex: 1,
    marginRight: 8,
    minWidth: 150,
    maxWidth: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  date: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  total: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  modalLabel: {
    fontWeight: 'bold',
    marginTop: 8,
    color: '#444',
  },
  modalValue: {
    color: '#333',
    marginBottom: 2,
  },
  closeButton: {
    backgroundColor: Colors.blue,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 18,
  },
});