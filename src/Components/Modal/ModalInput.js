import React from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import GlobalStyles from '../GlobalStyles';

const ModelInput = ({
  isModalVisible,
  setInputValue,
  inputValue,
  modalTitle,
  nameInput,
  handleModalClose,
  onClickSend,
  onClickRemove,
}) => {
  const handleInputChange = (text) => {
    setInputValue(text);
  };

  return (
    <View style={{ position: 'absolute', zIndex: 10, flex: 1 }}>
      <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={handleModalClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
                <Text
                  style={{
                    color: GlobalStyles.colors.dangerColor,
                  }}
                >
                  X
                </Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder={nameInput}
                onChangeText={handleInputChange}
                value={inputValue}
                cursorColor={GlobalStyles.colors.primary}
              />

              <View style={styles.buttonContainer}>
                <TouchableWithoutFeedback style={{ overflow: 'hidden' }} onPress={handleModalClose}>
                  <View style={[styles.btn, { backgroundColor: GlobalStyles.colors.warningColor }]}>
                    <Text style={{ color: '#fff' }}>Close</Text>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback style={{ overflow: 'hidden' }} onPress={onClickRemove}>
                  <View style={[styles.btn, { backgroundColor: GlobalStyles.colors.dangerColor }]}>
                    <Text style={{ color: '#fff' }}>Delete</Text>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={onClickSend}>
                  <View style={[styles.btn, { backgroundColor: GlobalStyles.colors.successColor }]}>
                    <Text style={{ color: '#fff' }}>Change</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContent: {
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: GlobalStyles.colors.primary,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 50,
    overflow: 'hidden',
  },
});

export default ModelInput;
