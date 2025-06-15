import React, { useState, useEffect } from "react";
import {
  Container,
  Text,
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Input,
  Select,
  HStack,
  Button,
  useToast,
  useColorModeValue,
  Textarea,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Link,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import axios from "axios";
import { SearchIcon, CloseIcon, ChatIcon, StarIcon } from "@chakra-ui/icons";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_BOOKS = `${API_BASE_URL}api/books`;
const API_AUTHORS = `${API_BASE_URL}api/authors`;
const API_GENRES = `${API_BASE_URL}api/genres`;
const API_USERS = `${API_BASE_URL}api/users`;
const API_BOOK_REQUESTS = `${API_BASE_URL}api/book_requests`;
const API_FAVORITES = `${API_BASE_URL}api/favorites`;
const API_NOTIFICATIONS = `${API_BASE_URL}api/notifications`;
const API_REVIEWS = `${API_BASE_URL}api/reviews`;

const SearchBooksOnHand = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState({});
  const [genres, setGenres] = useState([]);
  const [users, setUsers] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    author_id: "",
    genre_id: "",
  });
  const [requestData, setRequestData] = useState({
    book_id: null,
    recipient_id: null,
    content: "",
  });
  const [reviewData, setReviewData] = useState({
    book_id: null,
    name: "",
    text: "",
    rating: 1,
  });
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen: isRequestOpen, onOpen: onRequestOpen, onClose: onRequestClose } = useDisclosure();
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    console.log("Текущий пользователь:", user);
    const fetchData = async () => {
      try {
        const [booksResponse, genresResponse] = await Promise.all([
          fetchBooks(),
          fetchGenres(),
        ]);
        if (booksResponse) {
          await Promise.all([
            fetchAuthors(),
            fetchUsersForBooks(booksResponse),
            fetchFavorites(),
            fetchNotifications(),
          ]);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchData();
  }, [filters]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        `${API_BOOKS}?status=in_hand&search=${filters.search}&author_id=${filters.author_id}&genre_id=${filters.genre_id}`
      );
      const booksData = Array.isArray(response.data) ? response.data : [];
      setBooks(booksData);
      console.log("Загруженные книги:", booksData);
      return booksData;
    } catch (error) {
      console.error("Ошибка при загрузке книг:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось загрузить книги",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setBooks([]);
      return null;
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get(API_AUTHORS);
      const authorsData = Array.isArray(response.data)
        ? response.data.reduce((acc, author) => ({ ...acc, [author.id]: author }), {})
        : {};
      setAuthors(authorsData);
      console.log("Загруженные авторы:", authorsData);
    } catch (error) {
      console.error("Ошибка при загрузке авторов:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить авторов",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setAuthors({});
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(API_GENRES);
      const genresData = Array.isArray(response.data) ? response.data : [];
      setGenres(genresData);
      console.log("Загруженные жанры:", genresData);
    } catch (error) {
      console.error("Ошибка при загрузке жанров:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить жанры",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setGenres([]);
    }
  };

  const fetchUsersForBooks = async (books) => {
    const userIds = [...new Set(books.map((book) => book.user_id).filter(Boolean))];
    if (userIds.length === 0) {
      setUsers({});
      return;
    }

    try {
      const response = await axios.get(API_USERS);
      const usersData = Array.isArray(response.data)
        ? response.data
            .filter((u) => userIds.includes(u.user_id))
            .reduce((acc, user) => ({ ...acc, [user.user_id]: user }), {})
        : {};
      setUsers(usersData);
      console.log("Загруженные пользователи:", usersData);
    } catch (error) {
      console.error("Ошибка при загрузке пользователей:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о владельцах книг",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setUsers({});
    }
  };

  const fetchFavorites = async () => {
    if (!user || !user.id) return;
    try {
      const response = await axios.get(`${API_FAVORITES}?user_id=${user.id}`);
      const favoriteBooks = Array.isArray(response.data) ? response.data.map((fav) => fav.book_id) : [];
      setFavorites(new Set(favoriteBooks));
      console.log("Загруженное избранное:", favoriteBooks);
    } catch (error) {
      console.error("Ошибка при загрузке избранного:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: "Не удалось получить избранное",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchNotifications = async () => {
    if (!user || !user.id) return;
    try {
      const response = await axios.get(`${API_NOTIFICATIONS}?user_id=${user.id}`);
      const notificationsData = Array.isArray(response.data) ? response.data : [];
      setNotifications(notificationsData);
      console.log("Загруженные уведомления:", notificationsData);
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

  const toggleFavorite = async (bookId) => {
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

    try {
      if (favorites.has(bookId)) {
        await axios.delete(`${API_FAVORITES}/${user.id}/${bookId}`);
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          newFavorites.delete(bookId);
          return newFavorites;
        });
        toast({
          title: "Успех",
          description: "Книга удалена из избранного",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(API_FAVORITES, { user_id: user.id, book_id: bookId });
        setFavorites((prev) => new Set(prev).add(bookId));
        toast({
          title: "Успех",
          description: "Книга добавлена в избранное",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Ошибка при обновлении избранного:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось обновить избранное",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchBooks().then((booksData) => {
      if (booksData) {
        fetchAuthors();
        fetchUsersForBooks(booksData);
        fetchFavorites();
        fetchNotifications();
      }
    });
  };

  const resetFilters = () => {
    setFilters({ search: "", author_id: "", genre_id: "" });
    fetchBooks().then((booksData) => {
      if (booksData) {
        fetchAuthors();
        fetchUsersForBooks(booksData);
        fetchFavorites();
        fetchNotifications();
      }
    });
  };

  const openRequestModal = (book) => {
    if (!users[book.user_id]) {
      toast({
        title: "Ошибка",
        description: "Владелец книги не найден",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setRequestData({
      book_id: book.id,
      recipient_id: book.user_id,
      content: "",
    });
    onRequestOpen();
  };

  const sendRequest = async () => {
    if (!requestData.content) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите сообщение",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!user || !user.id) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован. Пожалуйста, войдите в систему.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        API_BOOK_REQUESTS,
        {
          book_id: requestData.book_id,
          recipient_id: requestData.recipient_id,
          content: requestData.content,
          sender_id: user.id,
        }
      );
      console.log("Ответ от сервера:", response.data);
      toast({
        title: "Успех",
        description: "Запрос отправлен владельцу книги",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onRequestClose();
      setRequestData({ book_id: null, recipient_id: null, content: "" });
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось отправить запрос",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openReviewModal = (book) => {
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

    setReviewData({
      book_id: book.id,
      name: user.name || "",
      text: "",
      rating: 1,
    });
    onReviewOpen();
  };

  const submitReview = async () => {
    if (!reviewData.text || !reviewData.name) {
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
        book_id: reviewData.book_id,
        user_id: user.id,
        name: reviewData.name,
        text: reviewData.text,
        rating: reviewData.rating,
      });
      console.log("Ответ от сервера:", response.data);
      toast({
        title: "Успех",
        description: "Отзыв успешно добавлен",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onReviewClose();
      setReviewData({ book_id: null, name: "", text: "", rating: 1 });
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

  return (
    <Container maxW="container.xl" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4} color={textColor}>
        Поиск книг на руках
      </Text>

      <HStack spacing={3} mb={6} flexWrap="wrap">
        <Input
          placeholder="Поиск по названию..."
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          size="lg"
          maxW={{ base: "100%", md: "300px" }}
        />
        <Select
          placeholder="Выберите автора"
          name="author_id"
          value={filters.author_id}
          onChange={handleFilterChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          size="lg"
          maxW={{ base: "100%", md: "200px" }}
        >
          {Object.values(authors).map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </Select>
        <Select
          placeholder="Выберите жанр"
          name="genre_id"
          value={filters.genre_id}
          onChange={handleFilterChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          size="lg"
          maxW={{ base: "100%", md: "200px" }}
        >
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </Select>
        <Button
          colorScheme="blue"
          leftIcon={<SearchIcon />}
          onClick={handleSearch}
          bg={useColorModeValue("blue.500", "blue.600")}
          color="white"
          size="lg"
          aria-label="Поиск"
        >
          Поиск
        </Button>
        <Button
          variant="outline"
          leftIcon={<CloseIcon />}
          onClick={resetFilters}
          color={textColor}
          borderColor={borderColor}
          size="lg"
          aria-label="Сброс"
        >
          Сбросить
        </Button>
      </HStack>

      {notifications.length > 0 && (
        <Box mb={6} p={4} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="bold" mb={2} color={textColor}>
            Уведомления
          </Text>
          {notifications.map((notification) => (
            <Text key={notification.id} color={textColor} mb={1}>
              {notification.message}
            </Text>
          ))}
        </Box>
      )}

      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={4} color={textColor}>
          Список книг
        </Text>
        {books.length === 0 ? (
          <Text color={textColor}>Книги не найдены</Text>
        ) : (
          <SimpleGrid columns={1} spacing={6}>
            {books.map((book) => (
              <Card
                key={book.id}
                bg={cardBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{
                  bg: useColorModeValue("gray.100", "gray.600"),
                  transform: "translateY(-4px)",
                  transition: "all 0.3s",
                }}
              >
                <CardBody p={6}>
                  <VStack align="start" spacing={4}>
                    <HStack justify="space-between" w="full">
                      <Link as={RouterLink} to={`/book/${book.id}`}>
                        <Text fontSize="2xl" fontWeight="bold" color={textColor} _hover={{ color: "blue.500" }}>
                          {book.title}
                        </Text>
                      </Link>
                      <IconButton
                        icon={<StarIcon />}
                        colorScheme={favorites.has(book.id) ? "yellow" : "gray"}
                        onClick={() => toggleFavorite(book.id)}
                        aria-label={favorites.has(book.id) ? "Удалить из избранного" : "Добавить в избранное"}
                      />
                    </HStack>
                    <Text fontSize="md" color={textColor}>
                      <strong>Автор:</strong>{" "}
                      {authors[book.author_id]?.name || "Неизвестен"}
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      <strong>ISBN:</strong> {book.isbn}
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      <strong>Жанры:</strong>{" "}
                      {book.genres && book.genres.length > 0
                        ? book.genres
                            .map((genreId) => genres.find((genre) => genre.id === genreId)?.name)
                            .filter(Boolean)
                            .join(", ")
                        : "Не указаны"}
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      <strong>Владелец:</strong>{" "}
                      {users[book.user_id]?.name || "Неизвестный владелец"}
                    </Text>
                    <Text fontSize="sm" color={textColor} noOfLines={3}>
                      {book.description || "Описание отсутствует"}
                    </Text>
                    <HStack spacing={3}>
                      <Button
                        colorScheme="teal"
                        leftIcon={<ChatIcon />}
                        size="md"
                        onClick={() => openRequestModal(book)}
                      >
                        Запросить книгу
                      </Button>
                      <Button
                        colorScheme="purple"
                        size="md"
                        onClick={() => openReviewModal(book)}
                      >
                        Оставить отзыв
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Модальное окно для запроса книги */}
      <Modal isOpen={isRequestOpen} onClose={onRequestClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Отправить запрос на книгу</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Отправка запроса владельцу книги «
                {books.find((b) => b.id === requestData?.book_id)?.title || "Не выбрано"}» (
                {requestData?.recipient_id && users[requestData.recipient_id]?.name
                  ? users[requestData.recipient_id].name
                  : "Неизвестный владелец"})
              </Text>
              <Textarea
                placeholder="Введите ваше сообщение..."
                name="content"
                value={requestData.content || ""}
                onChange={(e) => setRequestData({ ...requestData, content: e.target.value })}
                bg={useColorModeValue("gray.100", "gray.600")}
                color={textColor}
                rows={5}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={sendRequest}>
              Отправить
            </Button>
            <Button variant="outline" onClick={onRequestClose}>
              Отмена
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно для добавления отзыва */}
      <Modal isOpen={isReviewOpen} onClose={onReviewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Оставить отзыв</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Отзыв для книги «
                {books.find((b) => b.id === reviewData?.book_id)?.title || "Не выбрано"}»
              </Text>
              <FormControl isRequired>
                <FormLabel>Ваше имя</FormLabel>
                <Input
                  value={reviewData.name}
                  onChange={(e) => setReviewData({ ...reviewData, name: e.target.value })}
                  bg={useColorModeValue("gray.100", "gray.600")}
                  color={textColor}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Текст отзыва</FormLabel>
                <Textarea
                  placeholder="Ваш отзыв..."
                  value={reviewData.text}
                  onChange={(e) => setReviewData({ ...reviewData, text: e.target.value })}
                  bg={useColorModeValue("gray.100", "gray.600")}
                  color={textColor}
                  rows={5}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Рейтинг (1-5)</FormLabel>
                <NumberInput
                  min={1}
                  max={5}
                  value={reviewData.rating}
                  onChange={(value) => setReviewData({ ...reviewData, rating: parseInt(value) })}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={submitReview}>
              Отправить отзыв
            </Button>
            <Button variant="outline" onClick={onReviewClose}>
              Отмена
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SearchBooksOnHand;