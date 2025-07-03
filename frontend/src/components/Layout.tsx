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
  Avatar,
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

function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [setUserOnlineStatus] = useMutation(SET_USER_ONLINE_STATUS);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    if (user.id) {
      try {
        await setUserOnlineStatus({
          variables: {
            id: user.id,
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
      </List>
      <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
        {user.username && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: stringToColor(user.username),
                width: 40,
                height: 40,
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography
                sx={{
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.username}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
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