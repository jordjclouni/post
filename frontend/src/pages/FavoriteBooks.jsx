import React, { useState, useEffect } from "react";
import {
  Container,
  Text,
  Box,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  useToast,
  useColorModeValue,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import axios from "axios";
import { StarIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_FAVORITES = `${API_BASE_URL}api/favorites`;
const API_BOOKS = `${API_BASE_URL}api/books`;
const API_AUTHORS = `${API_BASE_URL}api/authors`;
const API_GENRES = `${API_BASE_URL}api/genres`;
const API_USERS = `${API_BASE_URL}api/users`;

const FavoriteBooks = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState({});
  const [genres, setGenres] = useState([]);
  const [users, setUsers] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const textColor = useColorModeValue("gray.800", "white");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

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

    const fetchData = async () => {
      try {
        await fetchFavorites();
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
  }, [user, navigate, toast]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API_FAVORITES}?user_id=${user.id}`);
      const favoriteBooks = Array.isArray(response.data) ? response.data.map((fav) => fav.book_id) : [];
      const favoritesSet = new Set(favoriteBooks);
      setFavorites(favoritesSet);
      console.log("Загруженное избранное:", favoriteBooks);
      if (favoriteBooks.length > 0) {
        await fetchBooks(favoriteBooks);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("Ошибка при загрузке избранного:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить избранное",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchBooks = async (favoriteBookIds) => {
    try {
      const response = await axios.get(API_BOOKS);
      const allBooks = Array.isArray(response.data) ? response.data : [];
      const filteredBooks = allBooks.filter((book) => favoriteBookIds.includes(book.id));
      setBooks(filteredBooks);
      console.log("Отфильтрованные избранные книги:", filteredBooks);
      await Promise.all([fetchAuthors(), fetchGenres(), fetchUsersForBooks(filteredBooks)]);
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

  const toggleFavorite = async (bookId) => {
    try {
      if (favorites.has(bookId)) {
        await axios.delete(`${API_FAVORITES}/${user.id}/${bookId}`);
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          newFavorites.delete(bookId);
          return newFavorites;
        });
        setBooks((prev) => prev.filter((book) => book.id !== bookId));
        toast({
          title: "Успех",
          description: "Книга удалена из избранного",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error.response?.data || error.message);
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось удалить из избранного",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <Container maxW="container.xl" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4} color={textColor}>
        Избранные книги
      </Text>
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={4} color={textColor}>
          Список избранных книг
        </Text>
        {books.length === 0 ? (
          <Text color={textColor}>У вас нет избранных книг</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
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
                  cursor: "pointer",
                }}
                onClick={() => handleBookClick(book.id)}
              >
                <CardBody p={6}>
                  <VStack align="start" spacing={4}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        color={textColor}
                        _hover={{ color: "teal.500" }}
                      >
                        {book.title}
                      </Text>
                      <IconButton
                        icon={<StarIcon />}
                        colorScheme={favorites.has(book.id) ? "yellow" : "gray"}
                        onClick={(e) => {
                          e.stopPropagation(); // Предотвращаем переход на страницу деталей
                          toggleFavorite(book.id);
                        }}
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
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Container>
  );
};

export default FavoriteBooks;