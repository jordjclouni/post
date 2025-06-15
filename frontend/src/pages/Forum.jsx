import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  VStack,
  Box,
  Text,
  Button,
  Input,
  Textarea,
  useToast,
  Spinner,
  useColorModeValue,
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
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_TOPICS = `${API_BASE_URL}api/topics`;

const Forum = () => {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get(API_TOPICS);
        setTopics(response.data);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить темы",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) fetchTopics();
  }, [authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTopic({ ...newTopic, [name]: value });
  };

  const handleCreateTopic = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему, чтобы создать тему",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    if (!newTopic.title.trim() || !newTopic.description.trim()) {
      toast({
        title: "Ошибка",
        description: "Название и описание обязательны",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(API_TOPICS, newTopic);
      setTopics([
        {
          id: response.data.id,
          title: newTopic.title,
          description: newTopic.description,
          user_id: user.id,
          user_name: user.name,
          created_at: new Date().toISOString(),
        },
        ...topics,
      ]);
      setNewTopic({ title: "", description: "" });
      onClose();
      toast({
        title: "Тема создана!",
        description: "Ваша тема успешно добавлена",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Не удалось создать тему";
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

  return (
    <Container maxW="800px" py={6}>
      <Heading mb={4} color={textColor} textAlign="center">
        Форум
      </Heading>

      <Button
        colorScheme="teal"
        onClick={onOpen}
        mb={6}
        width="full"
        _hover={{ bg: "teal.600" }}
      >
        Создать новую тему
      </Button>

      <VStack spacing={4} align="stretch">
        {topics.length === 0 ? (
          <Text color={textColor} textAlign="center">
            Тем пока нет. Создайте первую!
          </Text>
        ) : (
          topics.map((topic) => (
            <Box
              key={topic.id}
              p={4}
              bg={bgColor}
              borderWidth={1}
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="sm"
              _hover={{ boxShadow: "md", cursor: "pointer" }}
              onClick={() => navigate(`/topic/${topic.id}`)} // Переход на страницу темы (можно доработать)
            >
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                {topic.title}
              </Text>
              <Text color={textColor} noOfLines={2}>
                {topic.description}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Автор: {topic.user_name} | {new Date(topic.created_at).toLocaleDateString()}
              </Text>
            </Box>
          ))
        )}
      </VStack>

      {/* Модальное окно для создания темы */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader color={textColor}>Создать новую тему</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              <Input
                placeholder="Название темы"
                name="title"
                value={newTopic.title}
                onChange={handleInputChange}
                bg={useColorModeValue("gray.100", "gray.600")}
                color={textColor}
                borderColor={borderColor}
                _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
              />
              <Textarea
                placeholder="Описание темы"
                name="description"
                value={newTopic.description}
                onChange={handleInputChange}
                bg={useColorModeValue("gray.100", "gray.600")}
                color={textColor}
                borderColor={borderColor}
                _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              onClick={handleCreateTopic}
              isLoading={isSubmitting}
              loadingText="Создание..."
              mr={3}
              _hover={{ bg: "teal.600" }}
            >
              Создать
            </Button>
            <Button variant="ghost" onClick={onClose} color={textColor}>
              Отмена
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Forum;