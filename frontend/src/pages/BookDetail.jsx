import React, { useState, useEffect } from "react";
import {
  Container,
  Text,
  Box,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  Divider,
  Badge,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_BOOKS = `${API_BASE_URL}api/books`;
const API_AUTHORS = `${API_BASE_URL}api/authors`;
const API_GENRES = `${API_BASE_URL}api/genres`;
const API_USERS = `${API_BASE_URL}api/users`;
const API_REVIEWS = `${API_BASE_URL}api/reviews`;
const API_BOOK_MOVEMENTS = `${API_BASE_URL}api/book/movements`;

const BookDetail = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [genres, setGenres] = useState([]);
  const [owner, setOwner] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [movements, setMovements] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" или "desc"
  const { user } = useAuth();
  const [reviewForm, setReviewForm] = useState({
    name: user?.name || "", // Имя берется из useAuth (localStorage)
    text: "",
    rating: 1,
  });
  const toast = useToast();
  const navigate = useNavigate();
  const textColor = useColorModeValue("gray.800", "white");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("gray.100", "gray.600");

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        // Получаем информацию о книге
        const bookResponse = await axios.get(`${API_BOOKS}/${bookId}`);
        const bookData = bookResponse.data;
        setBook(bookData);

        // Получаем автора
        const authorResponse = await axios.get(API_AUTHORS);
        const authorsData = Array.isArray(authorResponse.data)
          ? authorResponse.data.reduce((acc, author) => ({ ...acc, [author.id]: author }), {})
          : {};
        setAuthor(authorsData[bookData.author_id] || null);

        // Получаем жанры
        const genresResponse = await axios.get(API_GENRES);
        const genresData = Array.isArray(genresResponse.data) ? genresResponse.data : [];
        setGenres(genresData);

        // Получаем владельца
        const userResponse = await axios.get(API_USERS);
        const usersData = Array.isArray(userResponse.data)
          ? userResponse.data.reduce((acc, user) => ({ ...acc, [user.user_id]: user }), {})
          : {};
        setOwner(usersData[bookData.user_id] || null);

        // Получаем отзывы
        const reviewsResponse = await axios.get(`${API_REVIEWS}?book_id=${bookId}`);
        let reviewsData = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [];
        // Сортируем отзывы при загрузке (по умолчанию по убыванию)
        reviewsData = [...reviewsData].sort((a, b) => (sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating));
        setReviews(reviewsData);

        // Получаем историю передвижений
        const movementsResponse = await axios.get(`${API_BOOK_MOVEMENTS}/${bookId}`);
        setMovements(movementsResponse.data.movements || []);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error.response?.data || error.message);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные книги",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/search-books-on-hand");
      }
    };

    fetchBookData();
  }, [bookId, navigate, toast, sortOrder]);

  // Обновляем reviewForm.name, если user изменится
  useEffect(() => {
    setReviewForm((prev) => ({ ...prev, name: user?.name || "" }));
  }, [user]);

  const handleReviewSubmit = async () => {
    if (!user || !user.id) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему, чтобы оставить отзыв",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    if (!reviewForm.name || !reviewForm.text) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(API_REVIEWS, {
        book_id: parseInt(bookId),
        user_id: user.id,
        name: reviewForm.name,
        text: reviewForm.text,
        rating: reviewForm.rating,
      });
      setReviews((prev) => {
        const updatedReviews = [...prev, response.data.review];
        return [...updatedReviews].sort((a, b) => (sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating));
      });
      setReviewForm({ name: user.name || "", text: "", rating: 1 });
      toast({
        title: "Успех",
        description: "Отзыв успешно добавлен",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Ошибка при отправке отзыва:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось добавить отзыв",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newSortOrder);
    setReviews((prev) => [...prev].sort((a, b) => (newSortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating)));
  };

  if (!book) {
    return (
      <Container maxW="container.xl" p={4}>
        <Text color={textColor}>Загрузка...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" p={4}>
      <Button
        mb={4}
        onClick={() => navigate("/search-books-on-hand")}
        colorScheme="blue"
        variant="outline"
      >
        Назад к поиску
      </Button>
      <Box mb={8}>
        <Text fontSize="3xl" fontWeight="bold" mb={4} color={textColor}>
          {book.title}
        </Text>
        <VStack align="start" spacing={3}>
          <Text fontSize="lg" color={textColor}>
            <strong>Автор:</strong> {author ? author.name : "Неизвестен"}
          </Text>
          <Text fontSize="lg" color={textColor}>
            <strong>ISBN:</strong> {book.isbn || "Не указан"}
          </Text>
          <Text fontSize="lg" color={textColor}>
            <strong>Жанры:</strong>{" "}
            {book.genres && book.genres.length > 0
              ? book.genres
                  .map((genreId) => genres.find((genre) => genre.id === genreId)?.name)
                  .filter(Boolean)
                  .join(", ")
              : "Не указаны"}
          </Text>
          <Text fontSize="lg" color={textColor}>
            <strong>Владелец:</strong> {owner ? owner.name : "Неизвестный владелец"}
          </Text>
          <Text fontSize="lg" color={textColor}>
            <strong>Статус:</strong> {book.status === "in_hand" ? "На руках" : "В ячейке"}
          </Text>
          <Text fontSize="md" color={textColor}>
            <strong>Описание:</strong>{" "}
            {book.description || "Описание отсутствует"}
          </Text>
        </VStack>
      </Box>

      <Divider mb={6} />

      {/* История передвижений */}
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold" mb={4} color={textColor}>
          История передвижений
        </Text>
        {movements.length === 0 ? (
          <Text color={textColor}>История передвижений отсутствует</Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {movements.map((movement, index) => (
              <Box
                key={index}
                p={4}
                bg={cardBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg" color={textColor}>
                  <strong>Действие:</strong> {movement.action}
                </Text>
                <Text fontSize="lg" color={textColor}>
                  <strong>Пользователь:</strong> {movement.user_name}
                </Text>
                <Text fontSize="lg" color={textColor}>
                  <strong>Местоположение:</strong> {movement.location}
                </Text>
                {movement.shelf_id && (
                  <Text fontSize="lg" color={textColor}>
                    <strong>Полка:</strong> {movement.shelf_id}
                  </Text>
                )}
                <Text fontSize="lg" color={textColor}>
                  <strong>Дата:</strong> {movement.date} {movement.time}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      <Divider mb={6} />

      <Box>
        <HStack justify="space-between" mb={4}>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            Отзывы
          </Text>
          <Button colorScheme="gray" onClick={handleSortToggle}>
            Сортировать по рейтингу: {sortOrder === "desc" ? "убыванию" : "возрастанию"}
          </Button>
        </HStack>

        {/* Форма для добавления отзыва */}
        <Box mb={6} p={4} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="bold" mb={3} color={textColor}>
            Оставить отзыв
          </Text>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Ваше имя</FormLabel>
              <Input
                value={reviewForm.name}
                isReadOnly={true} // Поле только для чтения
                bg={inputBg}
                color={textColor}
                placeholder="Имя будет автоматически заполнено после входа"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Текст отзыва</FormLabel>
              <Textarea
                value={reviewForm.text}
                onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                bg={inputBg}
                color={textColor}
                placeholder="Напишите ваш отзыв..."
                rows={5}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Рейтинг (1-5)</FormLabel>
              <NumberInput
                min={1}
                max={5}
                value={reviewForm.rating}
                onChange={(value) => setReviewForm({ ...reviewForm, rating: parseInt(value) })}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button colorScheme="purple" onClick={handleReviewSubmit}>
              Отправить отзыв
            </Button>
          </VStack>
        </Box>

        {/* Список отзывов */}
        <Box>
          {reviews.length === 0 ? (
            <Text color={textColor}>Отзывов пока нет. Будьте первым!</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {reviews.map((review) => (
                <Box
                  key={`${review.book_id}-${review.user_id}`}
                  p={4}
                  bg={cardBg}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold" color={textColor}>
                      {review.name}
                    </Text>
                    <Badge colorScheme={review.rating >= 4 ? "green" : review.rating >= 3 ? "yellow" : "red"}>
                      {review.rating}/5
                    </Badge>
                  </HStack>
                  <Text color={textColor}>{review.text}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default BookDetail;