import React, { useState, useEffect } from "react";
import {
  Container,
  Text,
  Box,
  VStack,
  HStack,
  Button,
  Textarea,
  useToast,
  useColorModeValue,
  Divider,
  Flex,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_CONVERSATIONS = `${API_BASE_URL}api/conversations`;

const Messenger = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const textColor = useColorModeValue("gray.800", "white");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("gray.100", "gray.600");

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

    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${API_CONVERSATIONS}?user_id=${user.id}`);
        const conversationsData = Array.isArray(response.data) ? response.data : [];
        setConversations(conversationsData);
        console.log("Загруженные беседы:", conversationsData);
      } catch (error) {
        console.error("Ошибка при загрузке бесед:", error.response?.data || error.message);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить беседы",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchConversations();
  }, [user, navigate, toast]);

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API_CONVERSATIONS}/${conversationId}/messages`);
      const messagesData = Array.isArray(response.data) ? response.data : [];
      setMessages(messagesData);
      console.log("Загруженные сообщения:", messagesData);
    } catch (error) {
      console.error("Ошибка при загрузке сообщений:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сообщения",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setMessages([]);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast({
        title: "Ошибка",
        description: "Сообщение не может быть пустым",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(`${API_CONVERSATIONS}/${selectedConversation.id}/messages`, {
        sender_id: user.id,
        content: newMessage,
      });
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      toast({
        title: "Успех",
        description: "Сообщение отправлено",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось отправить сообщение",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Функция для добавления 5 часов и форматирования времени в русском формате
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    // Добавляем 5 часов
    date.setHours(date.getHours() + 3);
    return {
      date: date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  return (
    <Container maxW="container.xl" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4} color={textColor}>
        Мессенджер
      </Text>
      <HStack align="start" spacing={4} h="80vh">
        {/* Список бесед */}
        <Box
          w={{ base: "100%", md: "30%" }}
          h="full"
          bg={cardBg}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          p={4}
          overflowY="auto"
        >
          <Text fontSize="lg" fontWeight="bold" mb={3} color={textColor}>
            Ваши беседы
          </Text>
          {conversations.length === 0 ? (
            <Text color={textColor}>У вас нет активных бесед</Text>
          ) : (
            <VStack spacing={3} align="start">
              {conversations.map((conv) => (
                <Box
                  key={conv.id}
                  w="full"
                  p={3}
                  bg={selectedConversation?.id === conv.id ? useColorModeValue("gray.200", "gray.600") : cardBg}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <Text fontWeight="bold" color={textColor}>
                    Книга: {conv.book_title || "Неизвестно"}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    С {conv.sender_id === user.id ? conv.recipient_name : conv.sender_name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {formatDateTime(conv.created_at).date}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* Чат */}
        <Box
          w={{ base: "100%", md: "70%" }}
          h="full"
          bg={cardBg}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          p={4}
          display="flex"
          flexDirection="column"
        >
          {selectedConversation ? (
            <>
              <Text fontSize="lg" fontWeight="bold" mb={3} color={textColor}>
                Чат по книге: {selectedConversation.book_title}
              </Text>
              <Divider mb={3} />
              <Box flex="1" overflowY="auto" mb={3}>
                {messages.length === 0 ? (
                  <Text color={textColor}>Сообщений пока нет</Text>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {messages.map((msg) => (
                      <Flex
                        key={msg.id}
                        justify={msg.sender_id === user.id ? "flex-end" : "flex-start"}
                      >
                        <Box
                          maxW="70%"
                          p={3}
                          bg={msg.sender_id === user.id ? "teal.500" : "gray.300"}
                          color={msg.sender_id === user.id ? "white" : "black"}
                          borderRadius="md"
                        >
                          <HStack spacing={2}>
                            <Avatar
                              size="sm"
                              name={msg.sender_name}
                              bg={msg.sender_id === user.id ? "teal.300" : "gray.400"}
                            />
                            <Box>
                              <Text fontSize="sm" fontWeight="bold">
                                {msg.sender_name}
                              </Text>
                              <Text>{msg.content}</Text>
                              <Text fontSize="xs" color={msg.sender_id === user.id ? "gray.200" : "gray.600"}>
                                {formatDateTime(msg.created_at).time}
                              </Text>
                            </Box>
                          </HStack>
                        </Box>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </Box>
              <HStack>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  bg={inputBg}
                  color={textColor}
                  resize="none"
                  rows={2}
                />
                <Button colorScheme="teal" onClick={handleSendMessage}>
                  Отправить
                </Button>
              </HStack>
            </>
          ) : (
            <Text color={textColor}>Выберите беседу, чтобы начать общение</Text>
          )}
        </Box>
      </HStack>
    </Container>
  );
};

export default Messenger;