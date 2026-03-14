import React from 'react'
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs'
import { colors } from '@/lib/theme'

export default function TabLayout() {
  return (
    <NativeTabs
      tintColor={colors.fg}
      iconColor={{ default: colors.muted, selected: colors.fg }}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="timeline">
        <Icon sf={{ default: 'clock', selected: 'clock.fill' }} />
        <Label>Timeline</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="health">
        <Icon sf={{ default: 'heart', selected: 'heart.fill' }} />
        <Label>Health</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chat">
        <Icon sf={{ default: 'bubble.left', selected: 'bubble.left.fill' }} />
        <Label>Chat</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'pawprint', selected: 'pawprint.fill' }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
