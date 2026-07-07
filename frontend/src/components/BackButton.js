import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { COLORS } from '../constants/colors'

export default function BackButton({ color = COLORS.primary }) {
  const navigation = useNavigation()

  if (!navigation.canGoBack()) return null

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.goBack()}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={[styles.arrow, { color }]}>←</Text>
      <Text style={[styles.text, { color }]}>Back</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  arrow: {
    fontSize: 20,
    marginRight: 4,
    lineHeight: 24,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
  },
})