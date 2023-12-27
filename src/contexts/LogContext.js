import { createContext } from 'react';
import Toast, { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import GlobalStyles from '../Components/GlobalStyles';

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderBottomColor: GlobalStyles.colors.successColor, borderBottomWidth: 5, borderLeftWidth: 0 }}
      text1Style={{ color: GlobalStyles.colors.successColor, fontSize: 14, fontWeight: '500' }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderBottomColor: GlobalStyles.colors.dangerColor, borderBottomWidth: 5, borderLeftWidth: 0 }}
      text1Style={{ color: GlobalStyles.colors.dangerColor, fontSize: 14, fontWeight: '500' }}
    />
  ),
  warning: (props) => (
    <InfoToast
      {...props}
      style={{ borderBottomColor: GlobalStyles.colors.warningColor, borderBottomWidth: 5, borderLeftWidth: 0 }}
      text1Style={{ color: GlobalStyles.colors.warningColor, fontSize: 14, fontWeight: '500' }}
    />
  ),
};

export const LogContext = createContext();

export const LogContextProvider = ({ children }) => {
  return (
    <LogContext.Provider value={{}}>
      {children}
      <Toast config={toastConfig} />
    </LogContext.Provider>
  );
};
