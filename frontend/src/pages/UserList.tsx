import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Typography,
  CircularProgress,
  Chip,
  Box,
} from '@mui/material';
import { Person as PersonIcon, Delete as DeleteIcon } from '@mui/icons-material';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      isOnline
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id)
  }
`;

interface User {
  id: string;
  username: string;
  email: string;
  isOnline: boolean;
}

export default function UserList() {
  const { loading, error, data } = useQuery(GET_USERS);
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser({
          variables: { id },
        });
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 4 }}>
          Error: {error.message}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Users
      </Typography>
      <List>
        {data.users.map((user: User) => (
          <ListItem
            key={user.id}
            sx={{
              mb: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
            }}
          >
            <ListItemAvatar>
              <Avatar>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={user.username}
              secondary={user.email}
            />
            <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {user.id !== currentUserId && (
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(user.id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
              <Chip
                label={user.isOnline ? 'Online' : 'Offline'}
                color={user.isOnline ? 'success' : 'default'}
                size="small"
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 