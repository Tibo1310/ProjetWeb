import React from 'react';
import { useQuery, gql } from '@apollo/client';
import {
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

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

interface User {
  id: string;
  username: string;
  email: string;
  isOnline: boolean;
}

export default function UserList() {
  const { loading, error, data } = useQuery(GET_USERS);

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
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
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
              '&:hover': {
                bgcolor: 'action.hover',
              },
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
            <Chip
              label={user.isOnline ? 'Online' : 'Offline'}
              color={user.isOnline ? 'success' : 'default'}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
} 