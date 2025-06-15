import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Image,
  Container,
  useColorModeValue,
  SimpleGrid,
  Link,
  IconButton,
  List,
  ListItem,
  Divider,
} from "@chakra-ui/react";
import axios from "axios";
import { ArrowForwardIcon, AtSignIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@chakra-ui/react";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_STATS = `${API_BASE_URL}api/stats`;
const API_BOOKS_AVAILABLE = `${API_BASE_URL}api/books/available`;
const API_INVENTORY = `${API_BASE_URL}api/inventory`;

const Home = () => {
  const [stats, setStats] = useState(null);
  const { user, loading } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(API_STATS);
        setStats(response.data);
      } catch (error) {
        console.error("Ошибка загрузки статистики:", error);
        setStats({
          registeredUsers: 789,
          totalSafeshelves: 50,
          availableBooks: 1200,
          reservedBooks: 100,
          inHandBooks: 50,
          totalBooks: 1350,
        });
      }
    };

    const fetchBooks = async () => {
      try {
        const response = await axios.get(API_BOOKS_AVAILABLE);
      } catch (error) {
        if (error.response?.status === 500) {
          toast({
            title: "Ошибка сервера",
            description: "Не удалось загрузить доступные книги. Пожалуйста, попробуйте позже.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    };

    fetchStats();
    fetchBooks();
  }, []);

  const handleExploreBooks = () => {
    navigate("/search");
  };

  const handleViewInventory = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему, чтобы просмотреть инвентарь",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    try {
      await axios.get(API_INVENTORY);
      navigate("/inventory");
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
          description: "Не удалось загрузить инвентарь",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error("Ошибка при загрузке инвентаря:", error);
      }
    }
  };

  if (!stats) {
    return (
      <Container maxW="container.xl" py={10}>
        <Box p={8} borderRadius={8} boxShadow="lg" bg={bgColor} borderWidth={1} borderColor={borderColor}>
          <VStack spacing={6} align="center">
            <Text color={textColor}>Загрузка статистики...</Text>
          </VStack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Box
        p={8}
        borderRadius={8}
        boxShadow="lg"
        bg={bgColor}
        borderWidth={1}
        borderColor={borderColor}
      >
        <VStack spacing={8} align="stretch">
          {/* Заголовок и описание */}
          <Heading as="h1" size="2xl" color={textColor} textAlign="center">
            Добро пожаловать в Буккроссинг
          </Heading>
          <Text fontSize="lg" color={textColor} textAlign="center">
            Участвуйте в буккросинге, находите книги, обменивайтесь находками и оставляйте книги для других. Создавайте сообщество книголюбов по всему миру!
          </Text>

          {/* Навигация по разделам */}
          <Box as="nav" bg={useColorModeValue("gray.100", "gray.700")} py={2} mb={6} borderRadius="md" boxShadow="sm">
            <List
              display="flex"
              justifyContent="center"
              flexWrap="wrap"
              gap={4}
              fontSize={{ base: "sm", md: "md" }}
              styleType="none"
            >
              <ListItem>
                <Link href="#intro" color="blue.600" fontWeight="bold">
                  О буккроссинге
                </Link>
              </ListItem>
              <ListItem>
                <Link href="#what-is" color="blue.600" fontWeight="bold">
                  Что такое буккроссинг
                </Link>
              </ListItem>
              <ListItem>
                <Link href="#process" color="blue.600" fontWeight="bold">
                  Процесс буккроссинга
                </Link>
              </ListItem>
              <ListItem>
                <Link href="#faq" color="blue.600" fontWeight="bold">
                  Вопросы и ответы
                </Link>
              </ListItem>
            </List>
          </Box>

          {/* Статистика */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={8}>
            <Stat
              px={{ base: 2, md: 4 }}
              py={5}
              borderRadius={8}
              boxShadow="md"
              bg={useColorModeValue("gray.50", "gray.700")}
            >
              <StatLabel fontWeight="medium" color={textColor}>
                Участников
              </StatLabel>
              <StatNumber fontSize="2xl" color={textColor}>
                {stats.registeredUsers?.toLocaleString() || "0"}
              </StatNumber>
              <StatHelpText color={textColor}>
                Зарегистрированных пользователей
              </StatHelpText>
            </Stat>

            <Stat
              px={{ base: 2, md: 4 }}
              py={5}
              borderRadius={8}
              boxShadow="md"
              bg={useColorModeValue("gray.50", "gray.700")}
            >
              <StatLabel fontWeight="medium" color={textColor}>
                Безопасных ячеек
              </StatLabel>
              <StatNumber fontSize="2xl" color={textColor}>
                {stats.totalSafeshelves?.toLocaleString() || "0"}
              </StatNumber>
              <StatHelpText color={textColor}>
                Мест хранения книг
              </StatHelpText>
            </Stat>

            <Stat
              px={{ base: 2, md: 4 }}
              py={5}
              borderRadius={8}
              boxShadow="md"
              bg={useColorModeValue("gray.50", "gray.700")}
            >
              <StatLabel fontWeight="medium" color={textColor}>
                Доступных книг
              </StatLabel>
              <StatNumber fontSize="2xl" color={textColor}>
                {stats.availableBooks?.toLocaleString() || "0"}
              </StatNumber>
              <StatHelpText color={textColor}>
                Книг в ячейках
              </StatHelpText>
            </Stat>

            <Stat
              px={{ base: 2, md: 4 }}
              py={5}
              borderRadius={8}
              boxShadow="md"
              bg={useColorModeValue("gray.50", "gray.700")}
            >
              <StatLabel fontWeight="medium" color={textColor}>
                Зарезервированных книг
              </StatLabel>
              <StatNumber fontSize="2xl" color={textColor}>
                {stats.reservedBooks?.toLocaleString() || "0"}
              </StatNumber>
              <StatHelpText color={textColor}>
                Книг, ожидающих забора
              </StatHelpText>
            </Stat>

            <Stat
              px={{ base: 2, md: 4 }}
              py={5}
              borderRadius={8}
              boxShadow="md"
              bg={useColorModeValue("gray.50", "gray.700")}
            >
              <StatLabel fontWeight="medium" color={textColor}>
                Книг в руках
              </StatLabel>
              <StatNumber fontSize="2xl" color={textColor}>
                {stats.inHandBooks?.toLocaleString() || "0"}
              </StatNumber>
              <StatHelpText color={textColor}>
                Книг, забранных пользователями
              </StatHelpText>
            </Stat>

            <Stat
              px={{ base: 2, md: 4 }}
              py={5}
              borderRadius={8}
              boxShadow="md"
              bg={useColorModeValue("gray.50", "gray.700")}
            >
              <StatLabel fontWeight="medium" color={textColor}>
                Всего книг
              </StatLabel>
              <StatNumber fontSize="2xl" color={textColor}>
                {stats.totalBooks?.toLocaleString() || "0"}
              </StatNumber>
              <StatHelpText color={textColor}>
                Все зарегистрированные книги
              </StatHelpText>
            </Stat>
          </SimpleGrid>
          
          <Divider borderColor={borderColor} my={8} />

          

          {/* Информация о буккроссинге */}
          <Box id="intro">
            <Heading as="h2" size="xl" mb={4} color={textColor}>
              О буккроссинге
            </Heading>
            <Text fontSize="lg" mb={4} color={textColor}>
              Буккроссинг — это практика обмена книгами по всему миру. Он помогает
              распространять книги, делиться любимыми произведениями и находить
              новые для чтения. Это движение вдохновляет людей выпускать книги в
              «свободное плавание», делая их доступными для других.
            </Text>
            <Text fontSize="lg" color={textColor}>
              Благодаря буккроссингу создаётся уникальная связь между людьми через
              книги, которые путешествуют по миру.
            </Text>
          </Box>

          {/* Что такое буккроссинг */}
          <Box id="what-is">
            <Heading as="h2" size="lg" mb={4} color={textColor}>
              Что такое буккроссинг
            </Heading>
            <Text fontSize="md" mb={4} color={textColor}>
              Буккроссинг (bookcrossing) возник в 2001 году по инициативе
              специалиста по интернет-технологиям, американца Рона Хорнбэкера.
              Движение из США переместилось в Европу и распространилось по всему
              миру. Сейчас более 2 миллионов участников и 10 миллионов книг
              участвуют в этой системе.
            </Text>
            <Text fontSize="md" mb={4} color={textColor}>
              Суть заключается в том, чтобы «освобождать» книги, позволяя им
              находить новых читателей. Каждая книга получает уникальный номер,
              который помогает отслеживать её путешествия и историю.
            </Text>
            <Text fontSize="md" color={textColor}>
              Представьте, что через несколько лет после «освобождения» книги вы
              получаете уведомление о том, что она была найдена на другом конце
              света. Это невероятный способ связаться с людьми через литературу.
            </Text>
          </Box>

          {/* Процесс буккроссинга */}
          <Box id="process">
            <Heading as="h2" size="lg" mb={4} color={textColor}>
              Процесс буккроссинга
            </Heading>
            <Text fontSize="md" mb={4} color={textColor}>
              Процесс буккроссинга очень простой:
            </Text>
            <List spacing={3} pl={6} fontSize="md" styleType="decimal" color={textColor}>
              <ListItem>
                Зарегистрируйте книгу на сайте, чтобы получить уникальный номер.
              </ListItem>
              <ListItem>
                Напишите номер в книге вручную или приклейте специальную наклейку.
              </ListItem>
              <ListItem>
                Оставьте книгу в общественном месте: парке, кафе, вокзале или другом удобном месте.
              </ListItem>
              <ListItem>
                Отметьте на сайте место, где книга была оставлена.
              </ListItem>
              <ListItem>
                Отслеживайте её путь и узнавайте истории тех, кто её нашёл.
              </ListItem>
            </List>
            <Text fontSize="md" mt={4} color={textColor}>
              Таким образом, каждая книга становится частью глобальной «библиотеки», и вы можете наблюдать, как она соединяет людей по всему миру.
            </Text>
          </Box>

          {/* Часто задаваемые вопросы */}
          <Box id="faq">
            <Heading as="h2" size="lg" mb={4} color={textColor}>
              Часто задаваемые вопросы
            </Heading>
            <List spacing={4} fontSize="md" color={textColor}>
              <ListItem>
                <Text as="b">Почему нужна регистрация?</Text>
                <br />
                Регистрация позволяет следить за книгами и участвовать в обсуждениях на форуме.
              </ListItem>
              <ListItem>
                <Text as="b">Как выглядит процесс?</Text>
                <br />
                Вы регистрируете книгу, оставляете её в общественном месте и наблюдаете за её путешествием.
              </ListItem>
              <ListItem>
                <Text as="b">Как вписать КН в книгу?</Text>
                <br />
                Вы можете написать номер вручную или использовать готовые наклейки, которые можно скачать на сайте.
              </ListItem>
              <ListItem>
                <Text as="b">Что делать, если я нашёл книгу?</Text>
                <br />
                Введите её номер на сайте, чтобы узнать её историю, оставить комментарий и продолжить её путешествие.
              </ListItem>
            </List>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default Home;