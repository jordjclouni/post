import React, { useState, useEffect } from "react";
import {
  Container,
  Text,
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  useColorModeValue,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_BOOKS = `${API_BASE_URL}api/books`;
const API_AUTHORS = `${API_BASE_URL}api/authors`;
const API_SHELVES = `${API_BASE_URL}api/safeshelves`;
const API_GENRES = `${API_BASE_URL}api/genres`;

const AdminBook = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    author_id: "",
    isbn: "",
    safe_shelf_id: "",
    genres: [],
    description: "",
    status: "available",
  });
  const [editBookId, setEditBookId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("teal.500", "teal.300");

  // Функция для загрузки списка книг
  const fetchBooks = async () => {
    try {
      const response = await axios.get(API_BOOKS, { withCredentials: true });
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить книги",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Ошибка загрузки книг:", error);
    }
  };

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    if (!user) {
      toast({
        title: "Ошибка авторизации",
        description: "Пожалуйста, войдите в систему",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [booksResponse, authorsResponse, shelvesResponse, genresResponse] = await Promise.all([
          axios.get(API_BOOKS, { withCredentials: true }),
          axios.get(API_AUTHORS, { withCredentials: true }),
          axios.get(API_SHELVES, { withCredentials: true }),
          axios.get(API_GENRES, { withCredentials: true }),
        ]);
        setBooks(Array.isArray(booksResponse.data) ? booksResponse.data : []);
        setAuthors(Array.isArray(authorsResponse.data) ? authorsResponse.data : []);
        setShelves(Array.isArray(shelvesResponse.data) ? shelvesResponse.data : []);
        setGenres(Array.isArray(genresResponse.data) ? genresResponse.data : []);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error("Ошибка загрузки данных:", error);
      }
    };
    fetchData();
  }, [user, navigate, toast]);

  // Обработка изменений в форме
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "genres" ? value.split(",").map((id) => parseInt(id.trim())).filter(Boolean) : value,
    }));
  };

  // Функция для сброса формы
  const resetForm = () => {
    setFormData({
      title: "",
      author_id: "",
      isbn: "",
      safe_shelf_id: "",
      genres: [],
      description: "",
      status: "available",
    });
    setEditBookId(null);
  };

  // Добавление или редактирование книги
  const handleAddOrEditBook = async () => {
    try {
      const userData = user || JSON.parse(localStorage.getItem("userData"));
      if (!userData) {
        toast({
          title: "Ошибка авторизации",
          description: "Пожалуйста, войдите в систему",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      console.log("Данные пользователя:", userData);

      if (editBookId) {
        const payload = {
          ...formData,
          genre_ids: formData.genres,
          user_id: userData.id,
        };
        console.log("Отправляемый payload для редактирования:", payload);
        await axios.put(`${API_BOOKS}/update/${editBookId}`, payload, {
          withCredentials: true,
        });
      } else {
        if (!formData.title || !formData.author_id || !formData.isbn || !formData.safe_shelf_id) {
          toast({
            title: "Ошибка",
            description: "Заполните все обязательные поля",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        const payload = {
          ...formData,
          genre_ids: formData.genres,
          user_id: userData.id,
        };
        console.log("Отправляемый payload для добавления:", payload);
        await axios.post(API_BOOKS, payload, {
          withCredentials: true,
        });
      }

      // Перезагружаем список книг после успешного добавления или редактирования
      await fetchBooks();

      toast({
        title: "Успех",
        description: editBookId ? "Книга обновлена" : "Книга добавлена",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      resetForm();
    } catch (error) {
      let errorMessage = "Не удалось сохранить книгу";
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
        console.log("Ответ сервера:", error.response.data);
      } else if (error.request) {
        errorMessage = "Нет ответа от сервера. Проверьте подключение к интернету.";
      } else {
        errorMessage = error.message;
      }

      toast({
        title: "Ошибка",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Ошибка сохранения книги:", error);
    }
  };

  // Подготовка к редактированию книги
  const handleEdit = (book) => {
    setEditBookId(book.id);
    setFormData({
      title: book.title || "",
      author_id: book.author_id || "",
      isbn: book.isbn || "",
      safe_shelf_id: book.safe_shelf_id || "",
      genres: book.genres || [],
      description: book.description || "",
      status: book.status || "available",
    });
    onOpen();
  };

  // Удаление книги
  const handleDelete = async (bookId) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту книгу?")) return;

    const userData = user || JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      toast({
        title: "Ошибка авторизации",
        description: "Пожалуйста, войдите в систему",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.delete(`${API_BOOKS}/${bookId}`, {
        headers: {
          "X-Role-ID": userData.role_id,
        },
        withCredentials: true,
      });
      // Перезагружаем список книг после удаления
      await fetchBooks();
      toast({
        title: "Успех",
        description: "Книга удалена",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      let errorMessage = "Не удалось удалить книгу";
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = "Нет ответа от сервера. Проверьте подключение к интернету.";
      } else {
        errorMessage = error.message;
      }

      toast({
        title: "Ошибка",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Ошибка удаления книги:", error);
    }
  };

  return (
    <Container maxW="1200px" my={4} bg={bgColor} borderRadius="lg" p={6} boxShadow="lg">
      <Text fontSize="4xl" fontWeight="bold" mb={4} color={textColor} textAlign="center">
        Администрирование книг
      </Text>

      <Box mb={6}>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          onClick={() => {
            setEditBookId(null);
            setFormData({
              title: "",
              author_id: "",
              isbn: "",
              safe_shelf_id: "",
              genres: [],
              description: "",
              status: "available",
            });
            onOpen();
          }}
          mb={4}
          bg={accentColor}
          _hover={{ bg: `${accentColor}.600`, transform: "scale(1.05)" }}
          transition="all 0.3s"
        >
          Добавить книгу
        </Button>
      </Box>

      <TableContainer borderRadius="md" boxShadow="md">
        <Table variant="simple" colorScheme="gray">
          <Thead>
            <Tr>
              <Th color={textColor}>Название</Th>
              <Th color={textColor}>Автор</Th>
              <Th color={textColor}>ISBN</Th>
              <Th color={textColor}>Место хранения</Th>
              <Th color={textColor}>Статус</Th>
              <Th color={textColor}>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {books.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" color={textColor}>
                  Книги не найдены
                </Td>
              </Tr>
            ) : (
              books.map((book) => (
                <Tr key={book.id}>
                  <Td color={textColor}>{book.title}</Td>
                  <Td color={textColor}>
                    {authors.find((a) => a.id === book.author_id)?.name || "Неизвестен"}
                  </Td>
                  <Td color={textColor}>{book.isbn}</Td>
                  <Td color={textColor}>
                    {shelves.find((s) => s.id === book.safe_shelf_id)?.name || "Не указано"}
                  </Td>
                  <Td color={textColor}>{book.status}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        leftIcon={<EditIcon />}
                        colorScheme="yellow"
                        size="sm"
                        onClick={() => handleEdit(book)}
                        _hover={{ bg: "yellow.600", transform: "scale(1.05)" }}
                        transition="all 0.3s"
                      >
                        Редактировать
                      </Button>
                      <Button
                        leftIcon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(book.id)}
                        _hover={{ bg: "red.600", transform: "scale(1.05)" }}
                        transition="all 0.3s"
                      >
                        Удалить
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg={bgColor} borderRadius="xl" boxShadow="2xl">
          <ModalHeader color={textColor}>
            {editBookId ? "Редактировать книгу" : "Добавить книгу"}
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired={!editBookId}>
                <FormLabel color={textColor}>Название</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
              <FormControl isRequired={!editBookId}>
                <FormLabel color={textColor}>Автор</FormLabel>
                <Select
                  name="author_id"
                  value={formData.author_id}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="">Выберите автора</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired={!editBookId}>
                <FormLabel color={textColor}>ISBN</FormLabel>
                <Input
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
              <FormControl isRequired={!editBookId}>
                <FormLabel color={textColor}>Место хранения</FormLabel>
                <Select
                  name="safe_shelf_id"
                  value={formData.safe_shelf_id}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="">Выберите место</option>
                  {shelves.map((shelf) => (
                    <option key={shelf.id} value={shelf.id}>
                      {shelf.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Жанры (ID через запятую)</FormLabel>
                <Input
                  name="genres"
                  value={formData.genres.join(",")}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                  placeholder="Пример: 1,2,3"
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Описание</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Статус</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="available">Доступна</option>
                  <option value="reserved">Зарезервирована</option>
                  <option value="inHand">На руках</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={handleAddOrEditBook}
              bg={accentColor}
              _hover={{ bg: `${accentColor}.600`, transform: "scale(1.05)" }}
              transition="all 0.3s"
            >
              {editBookId ? "Сохранить" : "Добавить"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              color={textColor}
              borderColor={accentColor}
              _hover={{ bg: `${accentColor}.50`, color: accentColor }}
              transition="all 0.3s"
            >
              Отмена
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminBook;