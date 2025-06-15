import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  VStack,
  Box,
  Text,
  Button,
  Textarea,
  useToast,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_TOPIC = `${API_BASE_URL}api/topic`;

const TopicDiscussion = () => {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await axios.get(`${API_TOPIC}/${id}`, { withCredentials: true });
        setTopic(response.data.topic);
        setMessages(response.data.messages);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить тему",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/forum");
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) fetchTopic();
  }, [id, authLoading, navigate, toast]);

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleCreateMessage = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему, чтобы отправить сообщение",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    if (!newMessage.trim()) {
      toast({
        title: "Ошибка",
        description: "Сообщение не может быть пустым",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_TOPIC}/${id}/messages`,
        { content: newMessage },
        { withCredentials: true }
      );
      setMessages([
        ...messages,
        {
          id: response.data.id,
          content: newMessage,
          topic_id: parseInt(id),
          user_id: user.id,
          user_name: user.name,
          created_at: new Date().toISOString(),
        },
      ]);
      setNewMessage("");
      toast({
        title: "Сообщение отправлено!",
        description: "Ваше сообщение добавлено в обсуждение",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Не удалось отправить сообщение";
      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Container maxW="800px" py={6} textAlign="center">
        <Spinner size="lg" color="teal.500" />
      </Container>
    );
  }

  if (!topic) {
    return (
      <Container maxW="800px" py={6} textAlign="center">
        <Text color={textColor}>Тема не найдена</Text>
      </Container>
    );
  }

  return (
    <Container maxW="800px" py={6}>
      <Heading mb={4} color={textColor}>
        {topic.title}
      </Heading>
      <Box
        p={4}
        bg={bgColor}
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="md"
        boxShadow="sm"
        mb={6}
      >
        <Text color={textColor}>{topic.description}</Text>
        <Text fontSize="sm" color="gray.500" mt={2}>
          Автор: {topic.user_name} | {new Date(topic.created_at).toLocaleDateString("ru-RU")}
        </Text>
      </Box>

      <Heading size="md" mb={4} color={textColor}>
        Обсуждение
      </Heading>
      <VStack spacing={3} align="stretch" mb={6}>
        {messages.length === 0 ? (
          <Text color={textColor}>Сообщений пока нет. Будьте первым!</Text>
        ) : (
          messages.map((message) => (
            <Box
              key={message.id}
              p={3}
              bg={bgColor}
              borderWidth={1}
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="sm"
            >
              <Text color={textColor}>{message.content}</Text>
              <Text fontSize="sm" color="gray.500">
                Автор: {message.user_name} | {new Date(message.created_at).toLocaleDateString("ru-RU")}
              </Text>
            </Box>
          ))
        )}
      </VStack>

      <Box>
        <Textarea
          placeholder="Напишите ваше сообщение..."
          value={newMessage}
          onChange={handleMessageChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
          mb={3}
        />
        <Button
          colorScheme="teal"
          onClick={handleCreateMessage}
          isLoading={isSubmitting}
          loadingText="Отправка..."
          _hover={{ bg: "teal.600" }}
        >
          Отправить
        </Button>
      </Box>
    </Container>
  );
};

export default TopicDiscussion;