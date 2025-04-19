import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  SafeAreaView,
} from 'react-native';

export default function App() {
  const [entries, setEntries] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [payment, setPayment] = useState('');
  const [rate, setRate] = useState('');
  const [currentRate, setCurrentRate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [filter, setFilter] = useState('All');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showEntriesTable, setShowEntriesTable] = useState(false);

  const updateRate = () => {
    if (!rate) return alert('Enter new rate');
    setCurrentRate(rate);
    setRate('');
    alert('Rate updated to ₹' + rate);
  };

  const addPurchase = () => {
    if (!quantity || !currentRate) return alert('Enter quantity and set rate first');
    const amount = parseFloat(quantity) * parseFloat(currentRate);
    const date = new Date();
    const entry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      type: 'purchase',
      quantity: parseFloat(quantity),
      rate: parseFloat(currentRate),
      amount,
      date: date.toISOString(),
    };
    if (isEditing) {
      const updated = [...entries];
      updated[editIndex] = entry;
      setEntries(updated);
      setIsEditing(false);
      setEditIndex(null);
    } else {
      setEntries([...entries, entry]);
    }
    setQuantity('');
  };

  const addPayment = () => {
    if (!payment) return alert('Enter payment amount');
    const date = new Date();
    const entry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      type: 'payment',
      amount: parseFloat(payment),
      date: date.toISOString(),
    };
    if (isEditing) {
      const updated = [...entries];
      updated[editIndex] = entry;
      setEntries(updated);
      setIsEditing(false);
      setEditIndex(null);
    } else {
      setEntries([...entries, entry]);
    }
    setPayment('');
  };

  const editEntry = (index) => {
    const entry = entries[index];
    if (entry.type === 'purchase') {
      setQuantity(entry.quantity.toString());
    } else {
      setPayment(entry.amount.toString());
    }
    setIsEditing(true);
    setEditIndex(index);
  };

  const deleteEntry = (index) => {
    Alert.alert('Delete', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => {
          const updated = [...entries];
          updated.splice(index, 1);
          setEntries(updated);
        },
      },
    ]);
  };

  const getFilteredEntries = () => {
    if (filter === 'All') return entries;
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().toISOString().slice(0, 7);
    return entries.filter((e) => {
      const entryDate = e.date.slice(0, 10);
      const entryMonth = e.date.slice(0, 7);
      if (filter === 'Today') return entryDate === today;
      return entryMonth === filter;
    });
  };

  const filteredEntries = getFilteredEntries();

  const totalMilk = filteredEntries.filter((e) => e.type === 'purchase').reduce((sum, e) => sum + e.quantity, 0);
  const totalPaid = filteredEntries.filter((e) => e.type === 'payment').reduce((sum, e) => sum + e.amount, 0);
  const totalAmount = filteredEntries.filter((e) => e.type === 'purchase').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalAmount - totalPaid;

  const openApp = (url) => {
    Linking.openURL(url).catch(() => alert('App not found'));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>🐄 MilkMetrics</Text>
        <Text style={styles.subheading}>Created by Abhishek Maheshwari</Text>

        <Text style={styles.label}>Update Rate (₹/L):</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={rate} onChangeText={setRate} />
        <Button title="Update Rate" color="#ff9800" onPress={updateRate} />

        <Text style={styles.label}>Enter Quantity (L):</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
        <Button title={isEditing ? 'Update Purchase' : 'Add Purchase'} color="#4caf50" onPress={addPurchase} />

        <Text style={styles.label}>Enter Payment (₹):</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={payment} onChangeText={setPayment} />
        <Button title={isEditing ? 'Update Payment' : 'Add Payment'} color="#2196f3" onPress={addPayment} />

        {/* Payment Apps */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <Button
            title="Google Pay"
            color="#4285F4"
            onPress={() => openApp('intent://upi/pay?pa=yourupi@okaxis&pn=MilkMetrics&cu=INR#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end')}
          />
          <Button title="PhonePe" color="#673ab7" onPress={() => openApp('phonepe://')} />
        </View>

        <Button title={showDashboard ? 'Hide Dashboard' : 'Show Dashboard'} onPress={() => setShowDashboard(!showDashboard)} />
        {showDashboard && (
          <View style={styles.dashboardBox}>
            <Text style={styles.tableText}>Dashboard Summary</Text>
            <Text style={styles.tableText}>Total Milk: {Math.round(totalMilk)} L</Text>
            <Text style={styles.tableText}>Total Amount: ₹{Math.round(totalAmount)}</Text>
            <Text style={styles.tableText}>Total Paid: ₹{Math.round(totalPaid)}</Text>
            <Text style={styles.tableText}>Balance: ₹{Math.round(balance)}</Text>
          </View>
        )}

        <Button title={showEntriesTable ? 'Hide Summary Table' : 'Show Summary Table'} onPress={() => setShowEntriesTable(!showEntriesTable)} />
        {showEntriesTable && (
          <View style={styles.tableContainer}>
            <Text style={styles.tableHeader}>Date</Text>
            <Text style={styles.tableHeader}>Type</Text>
            <Text style={styles.tableHeader}>Qty</Text>
            <Text style={styles.tableHeader}>Amount</Text>
            {filteredEntries.map((entry, index) => (
              <View key={entry.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{entry.date.slice(0, 10)}</Text>
                <Text style={styles.tableCell}>{entry.type}</Text>
                <Text style={styles.tableCell}>{entry.quantity || '-'}</Text>
                <Text style={styles.tableCell}>{entry.amount}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={() =>
            Alert.alert('Confirm', 'Are you sure you want to delete all entries?', [
              { text: 'Cancel' },
              { text: 'Delete All', style: 'destructive', onPress: () => setEntries([]) },
            ])
          }
          style={{ backgroundColor: 'red', padding: 10, borderRadius: 8, marginTop: 10, alignItems: 'center' }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete All Entries</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 100 },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: 'brown',
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  dashboardBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  tableText: {
    color: '#000',
    fontSize: 16,
    marginVertical: 2,
  },
  tableContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  tableHeader: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#555',
  },
});
