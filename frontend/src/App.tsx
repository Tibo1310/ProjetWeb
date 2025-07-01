import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserList from './pages/UserList';
import ConversationList from './pages/ConversationList';
import ConversationDetail from './pages/ConversationDetail';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/conversations" replace />} />
              <Route
                path="users"
                element={
                  <PrivateRoute>
                    <UserList />
                  </PrivateRoute>
                }
              />
              <Route
                path="conversations"
                element={
                  <PrivateRoute>
                    <ConversationList />
                  </PrivateRoute>
                }
              />
              <Route
                path="conversations/:id"
                element={
                  <PrivateRoute>
                    <ConversationDetail />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App; 