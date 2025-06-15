import React, { useState, useEffect, useRef } from "react";
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
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Link,
} from "@chakra-ui/react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import axios from "axios";
import { SearchIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';
const API_BOOKS = `${API_BASE_URL}api/books`;
const API_AUTHORS = `${API_BASE_URL}api/authors`;
const API_SHELVES = `${API_BASE_URL}api/safeshelves`;
const API_GENRES = `${API_BASE_URL}api/genres`;
const API_INVENTORY = `${API_BASE_URL}api/inventory`;
const API_LOGOUT = `${API_BASE_URL}api/logout`;
const API_REVIEWS = `${API_BASE_URL}api/reviews`;

const SearchBooks = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    author_id: "",
    safe_shelf_id: "",
    genre_id: "",
  });
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [reviewData, setReviewData] = useState({
    book_id: null,
    name: "",
    text: "",
    rating: 1,
  });
  const refs = useRef([]);
  const apiKey = "6ad7e365-54e3-4482-81b5-bd65125aafbf";
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchBooks(),
          fetchAuthors(),
          fetchShelves(),
          fetchGenres(),
        ]);
      } catch (error) {
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
  }, []);

  useEffect(() => {
    // Обновляем reviewData.name при изменении user
    setReviewData((prev) => ({ ...prev, name: user?.name || "" }));
  }, [user]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        `${API_BOOKS}?status=available&search=${filters.search}&author_id=${filters.author_id}&safe_shelf_id=${filters.safe_shelf_id}&genre_id=${filters.genre_id}`
      );
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (error.response?.status === 500) {
        toast({
          title: "Ошибка сервера",
          description: "Не удалось загрузить книги. Пожалуйста, попробуйте позже.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Ошибка",
          description: error.response?.data?.error || "Не удалось загрузить книги",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      console.error("Ошибка загрузки книг:", error);
      setBooks([]);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get(API_AUTHORS);
      setAuthors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Ошибка загрузки авторов:", error);
      setAuthors([]);
    }
  };

  const fetchShelves = async () => {
    try {
      const response = await axios.get(API_SHELVES);
      setShelves(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Ошибка загрузки полок:", error);
      setShelves([]);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(API_GENRES);
      setGenres(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Ошибка загрузки жанров:", error);
      setGenres([]);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchBooks();
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      author_id: "",
      safe_shelf_id: "",
      genre_id: "",
    });
    setSelectedBookId(null);
    fetchBooks();
  };

  const handleCardClick = (id) => {
    setSelectedBookId(id);
    scrollToBook(id);
  };

  const handlePlacemarkClick = (bookId) => {
    setSelectedBookId(bookId);
    scrollToBook(bookId);
  };

  const scrollToBook = (id) => {
    const index = books.findIndex((book) => book.id === id);
    if (index !== -1 && refs.current[index]) {
      refs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const addToInventory = async (bookId) => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему, чтобы добавить книгу в инвентарь",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }
  
    try {
      await axios.post(API_INVENTORY, {
        user_id: user.id,
        book_id: bookId,
      }, { withCredentials: true });
  
      toast({
        title: "Успех",
        description: "Книга добавлена в ваш инвентарь",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchBooks();
    } catch (error) {
      if (error.response?.status === 401) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, войдите в систему",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
      } else {
        toast({
          title: "Ошибка",
          description: error.response?.data?.error || "Не удалось добавить книгу в инвентарь",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      console.error("Ошибка добавления в инвентарь:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(API_LOGOUT);
      navigate("/login");
      toast({
        title: "Успех",
        description: "Вы вышли из системы",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Ошибка выхода:", error);
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
    <Container maxW="1200px" my={4}>
      <Text fontSize="4xl" fontWeight="bold" mb={4} color={textColor}>
        Поиск книг
      </Text>

      <HStack spacing={3} mb={4}>
        <Input
          placeholder="Поиск по названию..."
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
        />
        <Select
          placeholder="Выберите автора"
          name="author_id"
          value={filters.author_id}
          onChange={handleFilterChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
        >
          {authors.map((author) => (
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
        >
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </Select>
        <Select
          placeholder="Выберите место хранения"
          name="safe_shelf_id"
          value={filters.safe_shelf_id}
          onChange={handleFilterChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
        >
          {shelves.map((shelf) => (
            <option key={shelf.id} value={shelf.id}>
              {shelf.name}
            </option>
          ))}
        </Select>
        <Button
          colorScheme="blue"
          leftIcon={<SearchIcon />}
          onClick={handleSearch}
          bg={useColorModeValue("blue.500", "blue.300")}
          color="white"
          aria-label="Поиск"
        />
        <Button
          variant="outline"
          leftIcon={<CloseIcon />}
          onClick={resetFilters}
          color={textColor}
          borderColor={borderColor}
          aria-label="Сброс"
        />
      </HStack>

      <YMaps query={{ apikey: apiKey }}>
        <Map
          defaultState={{
            center: [53.669353, 23.813131],
            zoom: 13,
          }}
          width="100%"
          height="400px"
        >
          {shelves
            .filter((shelf) => shelf.latitude && shelf.longitude)
            .map((shelf) => {
              const booksOnShelf = books.filter(
                (book) => book.safe_shelf_id === shelf.id
              );
              if (booksOnShelf.length === 0) return null;
              return booksOnShelf.map((book) => (
                <Placemark
                  key={book.id}
                  geometry={[shelf.latitude, shelf.longitude]}
                  properties={{
                    balloonContent: `
                      <strong>${book.title}</strong><br/>
                      ISBN: ${book.isbn}<br/>
                      Ячейка: ${shelf.name}<br/>
                      Адрес: ${shelf.address}
                    `,
                    hintContent: book.title,
                  }}
                  options={{
                    preset:
                      selectedBookId === book.id
                        ? "islands#redDotIcon"
                        : "islands#greenDotIcon",
                  }}
                  onClick={() => handlePlacemarkClick(book.id)}
                />
              ));
            })}
        </Map>
      </YMaps>

      <Box mt={4}>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Кликните на маркер на карте или выберите книгу из списка!
        </Text>
      </Box>

      <Box mt={4}>
        <Text fontSize="xl" fontWeight="bold" mb={4} color={textColor}>
          Список книг
        </Text>
        {books.length === 0 ? (
          <Text color={textColor}>Книги не найдены</Text>
        ) : (
          <SimpleGrid columns={1} spacing={6}>
            {books.map((book, index) => (
              <Card
                key={book.id}
                ref={(el) => (refs.current[index] = el)}
                bg={selectedBookId === book.id ? "teal.700" : cardBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={selectedBookId === book.id ? "teal.300" : borderColor}
                _hover={{
                  bg: "teal.600",
                  transform: "translateY(-4px)",
                  transition: "all 0.3s",
                }}
                onClick={() => handleCardClick(book.id)}
              >
                <CardBody p={6}>
                  <VStack align="start" spacing={4}>
                    <Link as={RouterLink} to={`/book/${book.id}`}>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor} _hover={{ color: "blue.500" }}>
                        {book.title}
                      </Text>
                    </Link>
                    <Text fontSize="md" color={textColor}>
                      <strong>Автор:</strong>{" "}
                      {authors.find((a) => a.id === book.author_id)?.name || "Неизвестен"}
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      <strong>ISBN:</strong> {book.isbn}
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      <strong>Жанры:</strong>{" "}
                      {book.genres
                        .map((genreId) => genres.find((genre) => genre.id === genreId)?.name)
                        .filter(Boolean)
                        .join(", ") || "Не указаны"}
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      <strong>Место хранения:</strong>{" "}
                      {shelves.find((s) => s.id === book.safe_shelf_id)?.name || "Не указано"}
                    </Text>
                    <Text fontSize="sm" color={textColor} noOfLines={3}>
                      {book.description || "Описание отсутствует"}
                    </Text>
                    <HStack spacing={3}>
                      <Button
                        colorScheme="teal"
                        leftIcon={<AddIcon />}
                        size="md"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToInventory(book.id);
                        }}
                        isDisabled={book.status !== "available"}
                      >
                        Добавить в инвентарь
                      </Button>
                      <Button
                        colorScheme="purple"
                        size="md"
                        onClick={(e) => {
                          e.stopPropagation();
                          openReviewModal(book);
                        }}
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
                  isReadOnly={true}
                  bg={useColorModeValue("gray.100", "gray.600")}
                  color={textColor}
                  placeholder="Имя будет автоматически заполнено после входа"
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

export default SearchBooks;