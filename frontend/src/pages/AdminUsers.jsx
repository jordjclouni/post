import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Text,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  useToast,
  useColorModeValue,
  VStack,
  HStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';
const API_USERS = `${API_BASE_URL}api/users`;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role_id: "2",
    password: "",
  });
  const [editUserId, setEditUserId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("teal.500", "teal.300");

  // Функция для загрузки списка пользователей
  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_USERS, { withCredentials: true });
      const data = Array.isArray(response.data) ? response.data : [];
      console.log("Полученные данные пользователей:", data); // Для отладки
      setUsers(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Ошибка загрузки пользователей:", error);
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

    fetchUsers();
  }, [user, navigate, toast]);

  // Обработка изменений в форме
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Функция для сброса формы
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role_id: "2",
      password: "",
    });
    setEditUserId(null);
  };

  // Добавление или редактирование пользователя
  const handleAddOrEditUser = async () => {
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

      if (editUserId) {
        const payload = {
          role_id: parseInt(formData.role_id),
        };
        await axios.put(`${API_USERS}/${editUserId}`, payload, {
          withCredentials: true,
        });
      } else {
        if (!formData.name || !formData.email || !formData.password) {
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
          name: formData.name,
          email: formData.email,
          role_id: parseInt(formData.role_id),
          password: formData.password,
        };
        await axios.post(API_USERS, payload, {
          withCredentials: true,
        });
      }

      await fetchUsers();

      toast({
        title: "Успех",
        description: editUserId ? "Пользователь обновлен" : "Пользователь добавлен",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      resetForm();
    } catch (error) {
      let errorMessage = "Не удалось сохранить пользователя";
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
      console.error("Ошибка сохранения пользователя:", error);
    }
  };

  // Подготовка к редактированию пользователя
  const handleEdit = (user) => {
    if (!user || !user.user_id) {
      toast({
        title: "Ошибка",
        description: "Некорректные данные пользователя",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    console.log("Редактируемый пользователь:", user); // Для отладки
    setEditUserId(user.user_id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role_id: (user.role_id != null ? user.role_id.toString() : "2"), // Безопасная проверка
      password: "",
    });
    onOpen();
  };

  // Удаление пользователя
  const handleDelete = async (userId) => {
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Неверный ID пользователя",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!window.confirm("Вы уверены, что хотите удалить этого пользователя?")) return;

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
      await axios.delete(`${API_USERS}/${userId}`, {
        withCredentials: true,
      });
      await fetchUsers();
      toast({
        title: "Успех",
        description: "Пользователь удален",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      let errorMessage = "Не удалось удалить пользователя";
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
      console.error("Ошибка удаления пользователя:", error);
    }
  };

  return (
    <Container maxW="1200px" my={4} bg={bgColor} borderRadius="lg" p={6} boxShadow="lg">
      <Text fontSize="4xl" fontWeight="bold" mb={4} color={textColor} textAlign="center">
        Администрирование пользователей
      </Text>

      <Box mb={6}>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          onClick={() => {
            setEditUserId(null);
            setFormData({
              name: "",
              email: "",
              role_id: "2",
              password: "",
            });
            onOpen();
          }}
          mb={4}
          bg={accentColor}
          _hover={{ bg: `${accentColor}.600`, transform: "scale(1.05)" }}
          transition="all 0.3s"
        >
          Добавить пользователя
        </Button>
      </Box>

      <TableContainer borderRadius="md" boxShadow="md">
        <Table variant="simple" colorScheme="gray">
          <Thead>
            <Tr>
              <Th color={textColor}>ID</Th>
              <Th color={textColor}>Имя</Th>
              <Th color={textColor}>Email</Th>
              <Th color={textColor}>Роль</Th>
              <Th color={textColor}>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" color={textColor}>
                  Пользователи не найдены
                </Td>
              </Tr>
            ) : (
              users.map((user) => (
                <Tr key={user.user_id}>
                  <Td color={textColor}>{user.user_id}</Td>
                  <Td color={textColor}>{user.name || "Не указано"}</Td>
                  <Td color={textColor}>{user.email || "Не указано"}</Td>
                  <Td color={textColor}>{user.role_id === 1 ? "Администратор" : "Пользователь"}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        leftIcon={<EditIcon />}
                        colorScheme="yellow"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        _hover={{ bg: "yellow.600", transform: "scale(1.05)" }}
                        transition="all 0.3s"
                      >
                        Редактировать
                      </Button>
                      <Button
                        leftIcon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(user.user_id)}
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
            {editUserId ? "Редактировать пользователя" : "Добавить пользователя"}
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired={!editUserId}>
                <FormLabel color={textColor}>Имя</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                  isDisabled={editUserId !== null}
                />
              </FormControl>
              <FormControl isRequired={!editUserId}>
                <FormLabel color={textColor}>Email</FormLabel>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                  isDisabled={editUserId !== null}
                />
              </FormControl>
              <FormControl isRequired={!editUserId}>
                <FormLabel color={textColor}>Пароль</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                  isDisabled={editUserId !== null}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Роль</FormLabel>
                <Select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.100", "gray.700")}
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="1">Администратор</option>
                  <option value="2">Пользователь</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={handleAddOrEditUser}
              bg={accentColor}
              _hover={{ bg: `${accentColor}.600`, transform: "scale(1.05)" }}
              transition="all 0.3s"
            >
              {editUserId ? "Сохранить" : "Добавить"}
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

export default AdminUsers;