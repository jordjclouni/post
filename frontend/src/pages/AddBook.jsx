import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  Input,
  Textarea,
  Button,
  VStack,
  List,
  ListItem,
  Checkbox,
  Select,
  useToast,
  Spinner,
  useColorModeValue,
  Box,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_BOOKS = `${API_BASE_URL}api/books`;
const API_AUTHORS = `${API_BASE_URL}api/authors`;
const API_SHELVES = `${API_BASE_URL}api/safeshelves`;
const API_GENRES = `${API_BASE_URL}api/genres`;

const AddBook = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    author_id: "",
    author_search: "",
    new_author_name: "",
    new_author_description: "",
    description: "",
    safe_shelf_id: null,
    genre_ids: [],
    status: "in_hand",
    user_id: user?.id || null,
    isbn: "",
  });

  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [isFetchingISBN, setIsFetchingISBN] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (!user || !user.id) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему, чтобы добавить книгу",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        await Promise.all([fetchAuthors(), fetchShelves(), fetchGenres()]);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user, navigate, toast]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, user_id: user?.id || null }));
  }, [user]);

  const fetchAuthors = async (searchTerm = "") => {
    try {
      const response = await axios.get(API_AUTHORS, {
        params: { search: searchTerm },
        withCredentials: true,
      });
      setAuthors(response.data);
      setFilteredAuthors(response.data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить авторов",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchShelves = async () => {
    try {
      const response = await axios.get(API_SHELVES, { withCredentials: true });
      setShelves(response.data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить безопасные ячейки",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(API_GENRES, { withCredentials: true });
      setGenres(response.data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить жанры",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchISBN = async () => {
    if (!form.title.trim() || form.title.length < 3) {
      setForm((prev) => ({ ...prev, isbn: "Введите больше символов" }));
      return;
    }

    setIsFetchingISBN(true);
    try {
      const response = await axios.post(
        `${API_BOOKS}/fetch-isbn`,
        { title: form.title },
        { withCredentials: true }
      );
      const { isbn } = response.data;
      setForm((prev) => ({ ...prev, isbn: isbn || "ISBN не найден" }));
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось найти ISBN",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Ошибка API:", error.response?.data || error.message);
      setForm((prev) => ({ ...prev, isbn: "Ошибка поиска ISBN" }));
    } finally {
      setIsFetchingISBN(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value || (name === "safe_shelf_id" ? null : value) });

    if (name === "author_search") {
      fetchAuthors(value);
    }
  };

  const handleAuthorSelect = (author) => {
    setForm({
      ...form,
      author_id: author.id,
      author_search: author.name,
      new_author_name: "",
      new_author_description: "",
    });
    setFilteredAuthors([]);
  };

  const handleAddAuthor = async () => {
    if (!form.new_author_name.trim()) {
      toast({
        title: "Ошибка",
        description: "Имя нового автора обязательно",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAddingAuthor(true);
    try {
      const response = await axios.post(
        API_AUTHORS,
        {
          name: form.new_author_name,
          description: form.new_author_description || "",
        },
        { withCredentials: true }
      );

      const newAuthor = response.data;
      setAuthors([...authors, { id: newAuthor.id, name: newAuthor.name, description: newAuthor.description }]);
      setForm({
        ...form,
        author_id: newAuthor.id,
        author_search: newAuthor.name,
        new_author_name: "",
        new_author_description: "",
      });
      setFilteredAuthors([]);

      toast({
        title: "Автор добавлен!",
        description: `Автор ${newAuthor.name} успешно добавлен`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Не удалось добавить автора";
      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAddingAuthor(false);
    }
  };

  const handleGenreChange = (id) => {
    setForm((prevForm) => ({
      ...prevForm,
      genre_ids: prevForm.genre_ids.includes(id)
        ? prevForm.genre_ids.filter((g) => g !== id)
        : [...prevForm.genre_ids, id],
    }));
  };

  const handleSubmit = async () => {
    if (!user || !user.id) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему, чтобы добавить книгу",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    if (!form.title.trim() || !form.author_id || !form.description.trim() || !form.isbn) {
      toast({
        title: "Ошибка",
        description: "Название, автор, описание и ISBN обязательны!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (form.isbn === "ISBN не найден" || form.isbn === "Книга не найдена" || form.isbn === "Ошибка поиска ISBN") {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, найдите действительный ISBN перед добавлением книги.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        author_id: form.author_id,
        description: form.description,
        safe_shelf_id: null,
        user_id: user.id,
        genre_ids: form.genre_ids,
        status: form.status,
        isbn: form.isbn,
      };

      const bookResponse = await axios.post(API_BOOKS, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      const { book_id, isbn } = bookResponse.data;

      toast({
        title: "Книга добавлена!",
        description: `Книга добавлена в ваш инвентарь. ISBN: ${isbn}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setForm({
        title: "",
        author_id: "",
        author_search: "",
        new_author_name: "",
        new_author_description: "",
        description: "",
        safe_shelf_id: null,
        genre_ids: [],
        status: "in_hand",
        user_id: user?.id || null,
        isbn: "",
      });
      navigate("/profile");
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message || "Не удалось добавить книгу";
      if (status === 401) {
        toast({
          title: "Ошибка авторизации",
          description: "Пожалуйста, войдите в систему",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
      } else {
        toast({
          title: "Ошибка",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      console.error("Ошибка:", error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <Container maxW="600px" py={6} textAlign="center">
        <Spinner size="lg" color="teal.500" />
      </Container>
    );
  }

  return (
    <Container maxW="600px" py={6}>
      <Heading mb={4} color={textColor} textAlign="center">
        Добавить книгу
      </Heading>

      <VStack
        spacing={3}
        align="stretch"
        bg={bgColor}
        p={6}
        borderRadius={8}
        borderWidth={1}
        borderColor={borderColor}
        boxShadow="md"
      >
        <Input
          placeholder="Название книги"
          name="title"
          value={form.title}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />

        <Box>
          <Text color={textColor}>ISBN: {form.isbn || "Нажмите кнопку для поиска"}</Text>
          <Button
            colorScheme="teal"
            onClick={fetchISBN}
            isLoading={isFetchingISBN}
            loadingText="Поиск..."
            mt={2}
            _hover={{ bg: "teal.600" }}
          >
            Найти ISBN
          </Button>
        </Box>

        <Box position="relative">
          <Input
            placeholder="Поиск автора..."
            name="author_search"
            value={form.author_search}
            onChange={handleInputChange}
            bg={useColorModeValue("gray.100", "gray.600")}
            color={textColor}
            borderColor={borderColor}
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
          />
          {filteredAuthors.length > 0 && form.author_search && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              bg={bgColor}
              borderWidth={1}
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="md"
              zIndex={10}
              maxH="200px"
              overflowY="auto"
            >
              <List spacing={1}>
                {filteredAuthors.map((author) => (
                  <ListItem
                    key={author.id}
                    p={2}
                    _hover={{ bg: useColorModeValue("gray.200", "gray.600"), cursor: "pointer" }}
                    onClick={() => handleAuthorSelect(author)}
                  >
                    <Text color={textColor}>{author.name}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        <Input
          placeholder="Имя нового автора (если не нашли)"
          name="new_author_name"
          value={form.new_author_name}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
        <Textarea
          placeholder="Описание нового автора (опционально)"
          name="new_author_description"
          value={form.new_author_description}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
        <Button
          colorScheme="teal"
          onClick={handleAddAuthor}
          isLoading={isAddingAuthor}
          loadingText="Добавление автора..."
          size="sm"
          width="full"
          mt={2}
          _hover={{ bg: "teal.600" }}
        >
          Добавить нового автора
        </Button>

        <Textarea
          placeholder="Описание книги"
          name="description"
          value={form.description}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />

        <Select
          name="status"
          value={form.status}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
          isDisabled={true}
        >
          <option value="in_hand">У меня</option>
        </Select>

        <Heading size="sm" mt={2} color={textColor}>
          Выберите жанры:
        </Heading>
        <List spacing={2}>
          {genres.map((genre) => (
            <ListItem key={genre.id}>
              <Checkbox
                isChecked={form.genre_ids.includes(genre.id)}
                onChange={() => handleGenreChange(genre.id)}
                colorScheme="teal"
                color={textColor}
                borderColor={borderColor}
                _focus={{ boxShadow: "0 0 0 1px teal.500" }}
              >
                {genre.name}
              </Checkbox>
            </ListItem>
          ))}
        </List>

        <Button
          colorScheme="teal"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText="Добавление..."
          color="white"
          size="lg"
          width="full"
          mt={4}
          _hover={{ bg: "teal.600" }}
        >
          Добавить книгу
        </Button>
      </VStack>
    </Container>
  );
};

export default AddBook;