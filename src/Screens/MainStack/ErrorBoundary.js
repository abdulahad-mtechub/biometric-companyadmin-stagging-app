import React from 'react';
import ErrorScreen from './ErrorScreen';
import RNRestart from 'react-native-restart';
import { dispatch } from '@redux/Store/Store';
import { setServerRunning } from '@redux/Slices/errorSlice';
import logger from '@utils/logger';


class ErrorBoundaryWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  isServerRunning(value) {

    dispatch(setServerRunning(value));
  }


  componentDidCatch(error, errorInfo) {
    logger.log('Caught error:', error, { context:'ErrorBoundary' });
    logger.log('Component Stack:', errorInfo?.componentStack, { context:'ErrorBoundary' });

    const componentStack = errorInfo?.componentStack || '';
    const isFromHome = componentStack.includes('Home');
    logger.log({isFromHome}, { context:'ErrorBoundary' });
    

    this.setState({ 
      errorDetails: { error, componentStack: componentStack },
      isFromHome: isFromHome,
    });
  }

  handleRefresh = () => {
    RNRestart.restart(); // BOOM! Your app restarts instantly! 

    this.isServerRunning(true);
    this.setState({ hasError: false });
  };

  handleReportIssue = () => {
    // You can open email, show a form, or redirect

  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          onRefresh={this.handleRefresh}
          onReportIssue={this.handleReportIssue}
          errorDetails={this.state.errorDetails}
        />
      );
    }
  
    return this.props.children;
  }
  
}

export default function ErrorBoundary({ children, navigation }) {
  return <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>;
}
