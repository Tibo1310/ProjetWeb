import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  People as PeopleIcon,
  Chat as ChatIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const SET_USER_ONLINE_STATUS = gql`
  mutation SetUserOnlineStatus($id: String!, $isOnline: Boolean!) {
    setUserOnlineStatus(id: $id, isOnline: $isOnline) {
      id
      isOnline
    }
  }
`;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const [setUserOnlineStatus] = useMutation(SET_USER_ONLINE_STATUS);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
    if (userId) {
      try {
        await setUserOnlineStatus({
          variables: {
            id: userId,
            isOnline: false
          }
        });
      } catch (err) {
        console.error('Error setting offline status:', err);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 'bold',
          color: '#1976d2',
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
          Facebook Messenger
        </Typography>
      </Box>
      <List sx={{ flex: 1 }}>
        <ListItem button onClick={() => navigate('/users')}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
        <ListItem button onClick={() => navigate('/conversations')}>
          <ListItemIcon>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText primary="Conversations" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          p: 0,
        }}
      >
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
} 