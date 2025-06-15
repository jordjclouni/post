import React, { useState, useEffect } from "react";
import {
  Container,
  Text,
  Box,
  VStack,
  HStack,
  Button,
  useToast,
  useColorModeValue,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_MESSAGES = `${API_BASE_URL}api/messages`;

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [replyData, setReplyData] = useState({ message_id: null, content: "" });
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchMessages();
  }, [user, navigate]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(API_MESSAGES, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages(response.data);
      // Помечаем непрочитанные сообщения как прочитанные
      response.data
        .filter((msg) => !msg.is_read && msg.recipient_id === user.id)
        .forEach((msg) => markAsRead(msg.id));
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось загрузить сообщения",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`${API_MESSAGES}/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch (error) {
      console.error("Ошибка при пометке сообщения как прочитанного:", error);
    }
  };

  const openReplyModal = (message) => {
    setReplyData({
      message_id: message.id,
      content: "",
    });
    onOpen();
  };

  const sendReply = async () => {
    if (!replyData.content) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите сообщение",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const message = messages.find((m) => m.id === replyData.message_id);
      await axios.post(
        API_MESSAGES,
        {
          book_id: message.book_id,
          recipient_id: message.sender_id === user.id ? message.recipient_id : message.sender_id,
          content: replyData.content,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast({
        title: "Успех",
        description: "Ответ отправлен",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchMessages();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось отправить ответ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4} color={textColor}>
        Мои сообщения
      </Text>
      <VStack spacing={4} align="stretch">
        {messages.length === 0 ? (
          <Text color={textColor}>Сообщений нет</Text>
        ) : (
          messages.map((message) => (
            <Box
              key={message.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              borderColor={borderColor}
              bg={message.is_read ? bgColor : useColorModeValue("gray.50", "gray.700")}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold" color={textColor}>
                    {message.sender_id === user.id ? "Вы" : message.sender_name} →{" "}
                    {message.recipient_id === user.id ? "Вы" : message.recipient_name}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Книга: {message.book_title}
                  </Text>
                  <Text color={textColor}>{message.content}</Text>
                  <Text fontSize="xs" color={textColor}>
                    {new Date(message.created_at).toLocaleString()}
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  colorScheme="teal"
                  leftIcon={<ChatIcon />}
                  onClick={() => openReplyModal(message)}
                >
                  Ответить
                </Button>
              </HStack>
            </Box>
          ))
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ответить на сообщение</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Ответ о книге "{messages.find((m) => m.id === replyData.message_id)?.book_title}"
              </Text>
              <Textarea
                placeholder="Введите ваш ответ"
                value={replyData.content}
                onChange={(e) => setReplyData({ ...replyData, content: e.target.value })}
                bg={useColorModeValue("gray.100", "gray.600")}
                color={textColor}
                rows={5}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={sendReply}>
              Отправить
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Отмена
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Messages;