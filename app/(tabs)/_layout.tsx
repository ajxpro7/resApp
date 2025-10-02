import { Tabs } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { View, Platform, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useRouter } from "expo-router";
import { wp } from "@/helpers/common";


export default function TabsLayout() {
  const animationValues = useRef({
    home: new Animated.Value(1),
    todo: new Animated.Value(1),
    posten: new Animated.Value(1),
    leren: new Animated.Value(1),
    profiel: new Animated.Value(1),
  }).current;

    const navigation = useNavigation();
    const router = useRouter();
    const [isCreator, setIsCreator] = useState(false)

  const animateTab = (tabName) => {
    // Reset all animations
    Object.keys(animationValues).forEach(key => {
      Animated.spring(animationValues[key], {
        toValue: key === tabName ? 1.2 : 1,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        animation: 'shift',
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          // bottom: 25,
          // left: 20,
          // right: 20,
          elevation: 0,
          backgroundColor: "#1E1E1E",
          // borderRadius: 25,
          height: 75,
          width: wp(100),
          // marginBottom: 15,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          paddingBottom: Platform.OS === "android" ? 10 : 20,
        },
      }}
      screenListeners={{
        tabPress: (e) => {
          animateTab(e.target.split('-')[0]);
        },
      }}
    >
<Tabs.Screen
  name="home"
  options={{ 
    headerShown: false,
    headerTransparent: true,
    headerStyle: {backgroundColor: '#AEB6BF'},
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <Ionicons name="menu" size={24} color="black" style={{ marginLeft: 12 }} />
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity onPress={() => router.push("leren")}>
        <Ionicons name="heart-outline" size={24} color="black" style={{ marginRight: 12 }} />
      </TouchableOpacity>
    ),
          tabBarIcon: ({ focused }) => (
            <Animated.View style={{ 
              transform: [{ scale: animationValues.home }],
              marginBottom: -20 
            }}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? "#60A5FA" : "#60A5FA"}
              />
            </Animated.View>
          ),
  }}
/>


      <Tabs.Screen
        name="posten"
        options={{
          headerTransparent: true,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Animated.View style={{ 
              transform: [{ scale: animationValues.todo }],
              marginBottom: -20 
            }}>
              <Ionicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={34}
                color={focused ? "#60A5FA" : "#60A5FA"}
              />
            </Animated.View>
          ),
        }}
      />

      <Tabs.Screen
        name="profiel"
        options={{
              headerTransparent: true,
              headerShown: false,
              headerStyle: {backgroundColor: '#AEB6BF'},
              headerTitle: "my Idea",
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                  <Ionicons name="menu" size={24} color="black" style={{ marginLeft: 12 }} />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity onPress={() => router.push("leren")}>
                  <Ionicons name="heart-outline" size={24} color="black" style={{ marginRight: 12 }} />
                </TouchableOpacity>
              ),
          tabBarIcon: ({ focused }) => (
            <Animated.View style={{ 
              transform: [{ scale: animationValues.profiel }],
              marginBottom: -20 
            }}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={focused ? "#60A5FA" : "#60A5FA"}
              />
            </Animated.View>
          ),
        }}
      />
    </Tabs>
  );
}