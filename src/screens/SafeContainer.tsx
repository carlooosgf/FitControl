import React from "react";
import { View, ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  withHeader?: boolean;
  withFooter?: boolean;
};

export default function SafeContainer({ children, style, withHeader = false, withFooter = false }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={[
          {
            flex: 1,
            paddingTop: withHeader ? insets.top : 0,
            paddingBottom: withFooter ? 4 : 0,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
