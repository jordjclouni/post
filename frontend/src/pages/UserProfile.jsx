import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Container,
  Image,
  VStack,
  useColorModeValue,
  Spinner,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import RegisterBookModal from "../components/RegisterBookModal";

import { API_BASE_URL } from '../config/JS_apiConfig';

const API_USER_PROFILE = `${API_BASE_URL}api/user/profile`;

const UserProfile = () => {
  const { user, token, authFetch, logout, loading: authLoading, error: authError } = useAuth();
  const [isRegisterBookOpen, setIsRegisterBookOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("teal.500", "teal.300");

  const openRegisterBookModal = () => setIsRegisterBookOpen(true);
  const closeRegisterBookModal = () => setIsRegisterBookOpen(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !user.id) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему для просмотра профиля",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await authFetch(API_USER_PROFILE);
        setProfile(response.data);
      } catch (error) {
        console.error("Profile fetch error:", error);
        const localStorageUser = localStorage.getItem("user");
        if (localStorageUser) {
          try {
            const parsedUser = JSON.parse(localStorageUser);
            setProfile(parsedUser);
            
          } catch (parseError) {
            console.error("Error parsing localStorage user:", parseError);
          }
        } else {
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить профиль",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading, user, authFetch, toast, navigate]);

  if (authLoading || loading) {
    return (
      <Container maxW="600px" py={12} textAlign="center">
        <Spinner size="xl" color={accentColor} thickness="4px" />
      </Container>
    );
  }

  if (authError) {
    return (
      <Container maxW="600px" py={12} textAlign="center">
        <Text color="red.500" fontSize="lg">{authError}</Text>
      </Container>
    );
  }

  return (
    <Container maxW="600px" py={8}>
      <Text
        fontSize="3xl"
        fontWeight="bold"
        color={textColor}
        textAlign="center"
        mb={8}
        letterSpacing="wide"
        textTransform="uppercase"
      >
        Личный кабинет
      </Text>

      {profile && (
        <Box
          p={6}
          borderRadius="xl"
          bg={cardBgColor}
          boxShadow="lg"
          borderWidth="1px"
          borderColor={useColorModeValue("gray.200", "gray.700")}
          transition="all 0.3s ease"
          _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }}
        >
          <Flex direction="column" align="center" spacing={6}>
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Аватар"
                boxSize="120px"
                objectFit="cover"
                borderRadius="full"
                border="4px solid"
                borderColor={accentColor}
                mb={6}
              />
            ) : (
              <Box
                boxSize="120px"
                bg={useColorModeValue("gray.300", "gray.600")}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={6}
                border="4px solid"
                borderColor={accentColor}
              >
                <Text fontSize="lg" color={textColor} fontWeight="bold">
                  No Avatar
                </Text>
              </Box>
            )}

            <VStack spacing={3} align="stretch" w="full">
              <Text fontSize="xl" color={textColor} fontWeight="semibold">
                {profile.name || "Без имени"}
              </Text>
              <Text fontSize="md" color={useColorModeValue("gray.600", "gray.400")}>
                {profile.email || "Нет email"}
              </Text>
              {profile.bio && (
                <Text fontSize="md" color={useColorModeValue("gray.600", "gray.400")}>
                  {profile.bio}
                </Text>
              )}
              {profile.phone && (
                <Text fontSize="md" color={useColorModeValue("gray.600", "gray.400")}>
                  {profile.phone}
                </Text>
              )}
              {profile.birth_date && (
                <Text fontSize="md" color={useColorModeValue("gray.600", "gray.400")}>
                  {new Date(profile.birth_date).toLocaleDateString()}
                </Text>
              )}
            </VStack>
          </Flex>
        </Box>
      )}

      <Flex
        mt={8}
        gap={4}
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
      >
        {profile ? (
          <>
            <Button
              colorScheme="teal"
              size="lg"
              onClick={() => navigate("/edit-profile")}
              _hover={{ bg: "teal.600", transform: "scale(1.05)" }}
              transition="all 0.3s ease"
            >
              Редактировать
            </Button>
            
            <Button
              colorScheme="red"
              size="lg"
              onClick={logout}
              _hover={{ bg: "red.600", transform: "scale(1.05)" }}
              transition="all 0.3s ease"
            >
              Выйти
            </Button>
          </>
        ) : (
          <Button
            colorScheme="teal"
            size="lg"
            onClick={() => navigate("/login")}
            _hover={{ bg: "teal.600", transform: "scale(1.05)" }}
            transition="all 0.3s ease"
          >
            Войти
          </Button>
        )}
        
      </Flex>

      <RegisterBookModal isOpen={isRegisterBookOpen} onClose={closeRegisterBookModal} />
    </Container>
  );
};

export default UserProfile;