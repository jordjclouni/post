import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const RegisterModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    phone: "",
    birth_date: "",
    role_id: 2,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Имя не может быть пустым.";
    else if (formData.name.trim().length < 2) newErrors.name = "Имя должно содержать минимум 2 символа.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email не может быть пустым.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Введите корректный email.";

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!formData.password) newErrors.password = "Пароль не может быть пустым.";
    else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Пароль должен содержать минимум 6 символов, включая букву, цифру и спецсимвол.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role_id: formData.role_id,
          bio: formData.bio || null, // Отправляем null, если поле пустое
          phone: formData.phone || null,
          birth_date: formData.birth_date || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Регистрация успешна!",
          description: `Добро пожаловать, ${data.name}!`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });

        // Автоматический вход после регистрации
        const loginResponse = await fetch(`${API_BASE_URL}api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          // Предполагаем, что токен и user возвращаются в loginData
          localStorage.setItem("token", loginData.token || ""); // Обновите, если токен не возвращается
          localStorage.setItem("role_id", loginData.user.role_id);
          login(loginData.user, loginData.token || null);
        } else {
          toast({
            title: "Ошибка входа",
            description: loginData.error || "Не удалось войти после регистрации.",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }

        setFormData({
          name: "",
          email: "",
          password: "",
          bio: "",
          phone: "",
          birth_date: "",
          role_id: 2,
        });
        onClose();
      } else {
        toast({
          title: "Ошибка регистрации",
          description: data.error || "Что-то пошло не так.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
      toast({
        title: "Ошибка сети",
        description: "Не удалось подключиться к серверу. Попробуйте позже.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Регистрация</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!!errors.name}>
            <FormLabel>Имя</FormLabel>
            <Input
              placeholder="Введите ваше имя"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
          </FormControl>

          <FormControl mt={4} isRequired isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Введите ваш email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
          </FormControl>

          <FormControl mt={4} isRequired isInvalid={!!errors.password}>
            <FormLabel>Пароль</FormLabel>
            <Input
              type="password"
              placeholder="Введите ваш пароль"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>О себе (опционально)</FormLabel>
            <Textarea
              placeholder="Расскажите о себе"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Телефон (опционально)</FormLabel>
            <Input
              placeholder="Введите ваш телефон"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Дата рождения (опционально)</FormLabel>
            <Input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleInputChange}
            />
          </FormControl>

          <Button
            colorScheme="teal"
            mt={4}
            width="100%"
            onClick={handleRegister}
            isLoading={isLoading}
            loadingText="Регистрация..."
            isDisabled={isLoading}
          >
            Зарегистрироваться
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RegisterModal;