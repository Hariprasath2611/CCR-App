import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Avatar, Button, useTheme } from 'react-native-paper';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Palette } from '@theme/colors';
import { cardStyles } from '@theme/styles/cards';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StaffStackParamList } from '@navigation/types';

export const StaffDashboardScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={48} label={user?.name.substring(8, 10) || 'ST'} />
        <View style={styles.headerText}>
          <Text variant="titleMedium" style={styles.welcome}>Welcome,</Text>
          <Text variant="headlineSmall" style={styles.username}>{user?.name}</Text>
        </View>
      </View>

      <Card style={cardStyles.dashboardCard}>
        <Text style={cardStyles.cardTitle}>Today's Schedule</Text>
        <Text style={cardStyles.cardSubtitle}>Configure weekly target syllabus plan.</Text>
        <Button 
          mode="outlined" 
          compact 
          style={styles.btn} 
          onPress={() => navigation.navigate('WeeklyPlanForm')}
        >
          Create Target Plan
        </Button>
      </Card>

      <Card style={cardStyles.dashboardCard}>
        <Text style={cardStyles.cardTitle}>Weekly Plan & Progress</Text>
        <Text style={cardStyles.cardSubtitle}>Unit 3: Relational Algebra (Progress 60%)</Text>
        <Button 
          mode="contained" 
          compact 
          style={styles.btn} 
          onPress={() => navigation.navigate('ProgressLog', { subjectCode: 'CS8502' })}
        >
          Update Progress
        </Button>
      </Card>

      <Card style={cardStyles.dashboardCard}>
        <Text style={cardStyles.cardTitle}>Extra Hour Bookings</Text>
        <Text style={cardStyles.cardSubtitle}>Request approvals for extra academic teaching slots.</Text>
        <Button 
          mode="outlined" 
          compact 
          style={styles.btn} 
          onPress={() => navigation.navigate('ExtraHoursRequest')}
        >
          Book Slot
        </Button>
      </Card>

      <Button mode="text" onPress={logout} style={styles.logoutBtn} textColor={Palette.error}>
        Sign Out
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  headerText: {
    marginLeft: 16,
  },
  welcome: {
    color: Palette.textLight,
  },
  username: {
    fontWeight: 'bold',
    color: Palette.textDark,
  },
  btn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  logoutBtn: {
    marginVertical: 24,
  },
});
