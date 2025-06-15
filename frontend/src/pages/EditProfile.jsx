import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  VStack,
  Box,
  Text,
  Input,
  Textarea,
  Button,
  Image,
  useToast,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_USER_PROFILE = `${API_BASE_URL}api/user/profile`;
const API_USER_AVATAR = `${API_BASE_URL}api/user/avatar`;

const EditProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    birth_date: "",
    avatar_url: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(API_USER_PROFILE, { withCredentials: true });
        setProfile(response.data);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить профиль",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchProfile();
  }, [authLoading, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast({
        title: "Ошибка",
        description: "Выберите файл для аватара",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      setIsSubmitting(true);
      const response = await axios.post(API_USER_AVATAR, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setProfile({ ...profile, avatar_url: response.data.avatar_url });
      toast({
        title: "Аватар обновлён!",
        description: "Аватар успешно загружен",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Не удалось загрузить аватар";
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await axios.put(API_USER_PROFILE, profile, { withCredentials: true });
      toast({
        title: "Профиль обновлён!",
        description: "Ваши данные успешно сохранены",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/profile");
    } catch (error) {
      const message = error.response?.data?.error || "Не удалось обновить профиль";
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

  const handleCancel = () => {
    navigate("/profile");
  };

  if (loading || authLoading) {
    return (
      <Container maxW="600px" py={6} textAlign="center">
        <Spinner size="lg" color="teal.500" />
      </Container>
    );
  }

  return (
    <Container maxW="600px" py={6}>
      <Heading mb={4} color={textColor} textAlign="center">
        Редактировать профиль
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
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt="Аватар"
            boxSize="150px"
            objectFit="cover"
            borderRadius="full"
            mx="auto"
            mb={4}
          />
        ) : (
          <Box boxSize="150px" mx="auto" mb={4} bg="gray.200" borderRadius="full">
            <Text color={textColor} textAlign="center" pt="60px">
              Нет аватара
            </Text>
          </Box>
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
        />
        <Button
          colorScheme="teal"
          onClick={handleAvatarUpload}
          isLoading={isSubmitting}
          loadingText="Загрузка..."
          width="full"
          _hover={{ bg: "teal.600" }}
        >
          Загрузить аватар
        </Button>

        <Input
          placeholder="Имя"
          name="name"
          value={profile.name || ""}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
        <Text color={textColor}>Email: {profile.email}</Text> {/* Email нельзя изменить */}
        <Textarea
          placeholder="О себе"
          name="bio"
          value={profile.bio || ""}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
        <Input
          placeholder="Телефон"
          name="phone"
          value={profile.phone || ""}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
        <Input
          type="date"
          placeholder="Дата рождения"
          name="birth_date"
          value={profile.birth_date || ""}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
        <Box display="flex" gap={3}>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Сохранение..."
            width="full"
            _hover={{ bg: "teal.600" }}
          >
            Сохранить
          </Button>
          <Button
            variant="outline"
            colorScheme="gray"
            onClick={handleCancel}
            width="full"
            color={textColor}
            borderColor={borderColor}
            _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
          >
            Отмена
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default EditProfile;