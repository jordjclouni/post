import React, { useState, useEffect } from "react";
import {
  Container,
  Text,
  Box,
  VStack,
  useToast,
  useColorModeValue,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_NOTIFICATIONS = `${API_BASE_URL}api/notifications`;
const API_FAVORITES = `${API_BASE_URL}api/favorites`;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const textColor = useColorModeValue("gray.800", "white");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (!user || !user.id) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    const fetchNotifications = async () => {
      try {
        // Получаем уведомления
        const notificationsResponse = await axios.get(`${API_NOTIFICATIONS}?user_id=${user.id}`);
        const notificationsData = Array.isArray(notificationsResponse.data) ? notificationsResponse.data : [];
        setNotifications(notificationsData);

        // Получаем избранное для проверки статуса книг
        const favoritesResponse = await axios.get(`${API_FAVORITES}?user_id=${user.id}`);
        const favoritesData = Array.isArray(favoritesResponse.data) ? favoritesResponse.data : [];
        setFavorites(favoritesData.map(fav => fav.book_id));

        // Проверяем изменения статуса книг в избранном
        favoritesData.forEach(async (fav) => {
          const bookResponse = await axios.get(`${API_BASE_URL}api/books/${fav.book_id}`);
          const bookData = bookResponse.data;
          if (bookData.status !== fav.status && !notificationsData.some(n => n.message.includes(bookData.title))) {
            setNotifications(prev => [...prev, {
              id: Date.now() + Math.random(),
              message: `Статус книги "${bookData.title}" изменился на ${bookData.status}`,
              type: "status",
              timestamp: new Date().toISOString(),
            }]);
          }
        });
      } catch (error) {
        console.error("Ошибка при загрузке уведомлений:", error.response?.data || error.message);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить уведомления",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchNotifications();
  }, [user, navigate, toast]);

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Container maxW="container.xl" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4} color={textColor}>
        Уведомления
      </Text>
      <VStack spacing={4} align="stretch">
        {notifications.length === 0 ? (
          <Text color={textColor}>У вас нет новых уведомлений</Text>
        ) : (
          notifications.map((notification) => (
            <Alert
              key={notification.id}
              status={notification.type === "message" ? "info" : "warning"}
              borderRadius="md"
              bg={cardBg}
            >
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontWeight="bold" color={textColor}>
                  {notification.type === "message" ? "Новое сообщение" : "Изменение статуса"}
                </AlertTitle>
                <AlertDescription color={textColor}>
                  {notification.message}
                </AlertDescription>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {new Date(notification.timestamp).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </Text>
              </Box>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => handleDismissNotification(notification.id)}
                ml={4}
              >
                Удалить
              </Button>
            </Alert>
          ))
        )}
      </VStack>
    </Container>
  );
};

export default Notifications;