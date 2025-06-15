import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  VStack,
  Box,
  Text,
  Button,
  Textarea,
  Select,
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
  SimpleGrid,
  Badge,
  Flex,
  Avatar,
} from "@chakra-ui/react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_BOOKS = `${API_BASE_URL}api/books`;
const API_REVIEWS = `${API_BASE_URL}api/reviews`;

const BookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, loading: authLoading, authFetch } = useAuth();
  
  const [state, setState] = useState({
    book: null,
    reviews: [],
    loading: true,
    error: null,
    isSubmitting: false,
    newReview: { text: "", rating: "" }
  });

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (authLoading) return;

    const fetchBookData = async () => {
      try {
        const [bookResponse, reviewsResponse] = await Promise.all([
          axios.get(`${API_BOOKS}/${id}`),
          axios.get(`${API_REVIEWS}/${id}`)
        ]);
        
        setState(prev => ({
          ...prev,
          book: bookResponse.data,
          reviews: reviewsResponse.data,
          loading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.error || "Не удалось загрузить данные о книге"
        }));
        
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные о книге",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        
        navigate("/books");
      }
    };

    fetchBookData();
  }, [id, authLoading, navigate, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      newReview: { ...prev.newReview, [name]: value }
    }));
  };

  const handleAddReview = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Пожалуйста, войдите, чтобы оставить отзыв",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return navigate("/login", { state: { from: `/books/${id}` } });
    }

    const { text, rating } = state.newReview;
    if (!text.trim() || !rating) {
      toast({
        title: "Неполные данные",
        description: "Заполните текст и выберите рейтинг",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, isSubmitting: true }));
      
      const response = await authFetch(API_REVIEWS, {
        method: "POST",
        data: {
          book_id: id,
          text: text.trim(),
          rating: parseInt(rating)
        }
      });

      setState(prev => ({
        ...prev,
        reviews: [{
          book_id: id,
          user_id: user.id,
          name: user.name,
          avatar_url: user.avatar_url,
          text: text.trim(),
          rating: parseInt(rating),
          created_at: new Date().toISOString()
        }, ...prev.reviews],
        newReview: { text: "", rating: "" },
        isSubmitting: false
      }));

      onClose();
      toast({
        title: "Спасибо!",
        description: "Ваш отзыв успешно добавлен",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isSubmitting: false }));
      
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось добавить отзыв",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (state.loading || authLoading) {
    return (
      <Container maxW="800px" py={10} centerContent>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text mt={4} color={textColor}>Загрузка данных о книге...</Text>
      </Container>
    );
  }

  if (state.error || !state.book) {
    return (
      <Container maxW="800px" py={10} centerContent>
        <Text color="red.500" fontSize="lg">{state.error || "Книга не найдена"}</Text>
        <Button mt={4} colorScheme="teal" onClick={() => navigate("/books")}>
          Вернуться к списку книг
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="800px" py={6}>
      {/* Заголовок и основная информация */}
      <Flex direction="column" gap={6}>
        <Heading as="h1" size="xl" color={textColor} textAlign="center">
          {state.book.title}
        </Heading>

        <Box
          p={6}
          bg={bgColor}
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Автор: <Badge colorScheme="blue">{state.book.author?.name || "Неизвестен"}</Badge>
              </Text>
              <Text mt={2} color={textColor}>
                <strong>Жанры:</strong> {state.book.genres?.join(", ") || "Не указаны"}
              </Text>
              <Text color={textColor}>
                <strong>ISBN:</strong> {state.book.isbn || "Не указан"}
              </Text>
              <Text color={textColor}>
                <strong>Статус:</strong>{" "}
                <Badge colorScheme={state.book.status === "available" ? "green" : "orange"}>
                  {state.book.status === "available" ? "Доступна" : "У пользователя"}
                </Badge>
              </Text>
              {state.book.shelf_location && (
                <Text color={textColor}>
                  <strong>Местоположение:</strong> {state.book.shelf_location.address}
                </Text>
              )}
            </Box>

            <Box>
              <Text fontWeight="bold" color={textColor} mb={2}>
                Описание:
              </Text>
              <Text color={textColor}>
                {state.book.description || "Описание отсутствует"}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Блок отзывов */}
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h2" size="md" color={textColor}>
              Отзывы ({state.reviews.length})
            </Heading>
            <Button
              colorScheme="teal"
              onClick={onOpen}
              size="sm"
              _hover={{ bg: "teal.600" }}
            >
              Оставить отзыв
            </Button>
          </Flex>

          {state.reviews.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color={textColor} fontSize="lg">
                Пока нет отзывов. Будьте первым!
              </Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              {state.reviews.map((review, index) => (
                <Box
                  key={`${review.user_id}-${index}`}
                  p={4}
                  bg={bgColor}
                  borderRadius="md"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Flex align="center" gap={3} mb={2}>
                    <Avatar
                      size="sm"
                      name={review.name}
                      src={review.avatar_url}
                    />
                    <Text fontWeight="bold" color={textColor}>
                      {review.name}
                    </Text>
                    <Badge colorScheme="yellow" ml="auto">
                      {review.rating}/5
                    </Badge>
                  </Flex>
                  <Text color={textColor}>{review.text}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Flex>

      {/* Модальное окно отзыва */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader color={textColor}>Ваш отзыв</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Textarea
                placeholder="Расскажите о вашем впечатлении от книги..."
                name="text"
                value={state.newReview.text}
                onChange={handleInputChange}
                minH="150px"
                bg={useColorModeValue("gray.50", "gray.700")}
                color={textColor}
                borderColor={borderColor}
                _focus={{ borderColor: "teal.500" }}
              />
              <Select
                placeholder="Оцените книгу"
                name="rating"
                value={state.newReview.rating}
                onChange={handleInputChange}
                bg={useColorModeValue("gray.50", "gray.700")}
                color={textColor}
                borderColor={borderColor}
                _focus={{ borderColor: "teal.500" }}
              >
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>
                    {"⭐".repeat(num)} ({num}/5)
                  </option>
                ))}
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={onClose}
              mr={3}
              color={textColor}
            >
              Отмена
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleAddReview}
              isLoading={state.isSubmitting}
              loadingText="Отправка..."
              isDisabled={!state.newReview.text.trim() || !state.newReview.rating}
            >
              Опубликовать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default BookPage;