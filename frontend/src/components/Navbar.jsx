import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  Button,
  useColorMode,
  Text,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Spinner,
  Fade,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon, HamburgerIcon, ChevronDownIcon } from "@chakra-ui/icons";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from '../config/JS_apiConfig';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Проверка роли пользователя
  const roleId = user?.role_id || Number(localStorage.getItem("role_id"));
  const isAdmin = roleId === 1;

  const mainLinks = [
    { path: "/", label: "Главная" },
    { path: "/place", label: "Места" },
    { path: "/forum", label: "Форум" },
  ];

  const searchLinks = [
    { path: "/search", label: "В безопасных ячейках" },
    { path: "/search-books-on-hand", label: "Книги на руках" },
    { path: "/favorites", label: "Избранное" },
  ];

  const libraryLinks = [
    { path: "/inventory", label: "Ваша библиотека" },
    { path: "/addbook", label: "Добавление книг" },
    { path: "/profile", label: "Личный кабинет" },
    { path: "/messenger", label: "Сообщения" },
  ];

  const adminLinks = [
    { path: "/admin/safe-shelves", label: "Безопасные ячейки" },
    { path: "/admin/genres", label: "Жанры" },
    { path: "/admin/authors", label: "Авторы" },
    { path: "/admin/book", label: "Книги" },
    { path: "/admin/users", label: "Пользователи" },
  ];

  // Функция для обработки выхода
  const handleLogout = async () => {
    try {
      await logout(); // Вызываем logout из AuthContext
      localStorage.clear(); // Полностью очищаем localStorage
      onClose(); // Закрываем мобильное меню, если открыто
      window.location.reload(); // Обновляем страницу
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <Box
      as="nav"
      bg={colorMode === "light" 
        ? "linear-gradient(to right, #F5E6CC, #D4A373)" 
        : "linear-gradient(to right,rgb(68, 117, 167),rgb(190, 190, 143))"}
      boxShadow="lg"
      px={{ base: 2, md: 6 }}
      py={{ base: 2, md: 3 }}
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottom="2px solid"
      borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
    >
      <Flex justifyContent="space-between" alignItems="center" maxW="1200px" mx="auto">
        {/* Логотип */}
        <Link to="/">
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="extrabold"
            bgGradient="linear(to-r, teal.400, cyan.500)"
            bgClip="text"
            _hover={{
              bgGradient: "linear(to-r, teal.500, cyan.600)",
              transition: "all 0.3s ease",
            }}
          >
            Буккроссинг
          </Text>
        </Link>

        {/* Навигация для ПК */}
        <HStack
          as="ul"
          display={{ base: "none", md: "flex" }}
          spacing={{ base: 3, md: 6 }}
          alignItems="center"
        >
          {mainLinks.map((link) => (
            <Box key={link.path} position="relative">
              <Text
                as={Link}
                to={link.path}
                fontWeight={location.pathname === link.path ? "bold" : "medium"}
                color={location.pathname === link.path ? "teal.500" : colorMode === "light" ? "gray.800" : "gray.200"}
                _hover={{
                  color: "teal.600",
                  textDecoration: "underline",
                  transition: "all 0.2s ease",
                }}
                px={2}
                py={1}
                borderRadius="md"
              >
                {link.label}
              </Text>
              {location.pathname === link.path && (
                <Box
                  position="absolute"
                  bottom="-4px"
                  left="0"
                  right="0"
                  height="2px"
                  bg="teal.500"
                  transition="all 0.3s ease"
                />
              )}
            </Box>
          ))}

          {/* Выпадающее меню "Поиск книг" */}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              color={searchLinks.some((link) => link.path === location.pathname) ? "teal.500" : colorMode === "light" ? "gray.800" : "gray.200"}
              fontWeight={searchLinks.some((link) => link.path === location.pathname) ? "bold" : "medium"}
              _hover={{ color: "teal.600" }}
              _active={{ bg: "teal.50" }}
            >
              Поиск книг
            </MenuButton>
            <MenuList>
              {searchLinks.map((link) => (
                <MenuItem
                  key={link.path}
                  as={Link}
                  to={link.path}
                  color={location.pathname === link.path ? "teal.500" : "gray.600"}
                  _hover={{ bg: "teal.50", color: "teal.600" }}
                >
                  {link.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Выпадающее меню "Личная библиотека" */}
          {user && !isAdmin && (
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
                color={libraryLinks.some((link) => link.path === location.pathname) ? "teal.500" : colorMode === "light" ? "gray.800" : "gray.200"}
                fontWeight={libraryLinks.some((link) => link.path === location.pathname) ? "bold" : "medium"}
                _hover={{ color: "teal.600" }}
                _active={{ bg: "teal.50" }}
              >
                Личная библиотека
              </MenuButton>
              <MenuList>
                {libraryLinks.map((link) => (
                  <MenuItem
                    key={link.path}
                    as={Link}
                    to={link.path}
                    color={location.pathname === link.path ? "teal.500" : "gray.600"}
                    _hover={{ bg: "teal.50", color: "teal.600" }}
                  >
                    {link.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}

          {/* Выпадающее меню "Админ-панель" */}
          {isAdmin && (
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                colorScheme="purple"
                size="sm"
                variant="solid"
                _hover={{ bg: "purple.600", transform: "scale(1.05)" }}
                _active={{ bg: "purple.700" }}
                transition="all 0.2s ease"
              >
                Админ-панель
              </MenuButton>
              <MenuList>
                {adminLinks.map((link) => (
                  <MenuItem
                    key={link.path}
                    as={Link}
                    to={link.path}
                    color={location.pathname === link.path ? "teal.500" : "gray.600"}
                    _hover={{ bg: "teal.50", color: "teal.600" }}
                  >
                    {link.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}

          {/* Кнопки для авторизации */}
          {loading ? (
            <Spinner size="md" color="teal.500" />
          ) : user ? (
            <HStack spacing={2}>
              <Button
                onClick={handleLogout}
                colorScheme="red"
                size="sm"
                variant="outline"
                _hover={{ bg: "red.500", color: "white", transform: "scale(1.05)" }}
                transition="all 0.2s ease"
              >
                Выйти
              </Button>
            </HStack>
          ) : (
            <HStack spacing={2}>
              <Button
                onClick={() => setIsRegisterOpen(true)}
                colorScheme="teal"
                size="sm"
                variant="solid"
                _hover={{ bg: "teal.600", transform: "scale(1.05)" }}
                transition="all 0.2s ease"
              >
                Зарегистрироваться
              </Button>
              <Button
                onClick={() => setIsLoginOpen(true)}
                colorScheme="cyan"
                size="sm"
                variant="outline"
                _hover={{ bg: "cyan.500", color: "white", transform: "scale(1.05)" }}
                transition="all 0.2s ease"
              >
                Войти
              </Button>
            </HStack>
          )}
        </HStack>

        {/* Переключатель темы и мобильное меню */}
        <HStack alignItems="center" gap={2}>
          <IconButton
            aria-label="Toggle Theme"
            onClick={toggleColorMode}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            size="sm"
            variant="ghost"
            colorScheme="teal"
            _hover={{ bg: "teal.100", transform: "rotate(360deg)", transition: "all 0.5s ease" }}
          />
          <IconButton
            aria-label="Open Menu"
            icon={<HamburgerIcon />}
            size="sm"
            variant="ghost"
            display={{ base: "block", md: "none" }}
            colorScheme="teal"
            onClick={onOpen}
            _hover={{ bg: "teal.100", transform: "scale(1.1)", transition: "all 0.2s ease" }}
          />
        </HStack>
      </Flex>

      {/* Мобильное меню */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg={colorMode === "light" ? "white" : "gray.800"} borderLeft="2px solid" borderColor="teal.500">
          <DrawerCloseButton color="teal.500" _hover={{ color: "teal.600" }} />
          <DrawerBody p={4}>
            <VStack spacing={4} align="stretch">
              {mainLinks.map((link) => (
                <Button
                  as={Link}
                  to={link.path}
                  key={link.path}
                  width="full"
                  justifyContent="flex-start"
                  colorScheme={location.pathname === link.path ? "teal" : "gray"}
                  variant={location.pathname === link.path ? "solid" : "ghost"}
                  _hover={{ bg: "teal.50", color: "teal.600" }}
                  onClick={onClose}
                  transition="all 0.2s ease"
                >
                  {link.label}
                </Button>
              ))}

              {/* Раздел "Поиск книг" в мобильном меню */}
              <Box>
                <Text fontWeight="bold" color="teal.500" mb={2}>Поиск книг</Text>
                <VStack spacing={2} align="stretch">
                  {searchLinks.map((link) => (
                    <Button
                      as={Link}
                      to={link.path}
                      key={link.path}
                      width="full"
                      justifyContent="flex-start"
                      colorScheme={location.pathname === link.path ? "teal" : "gray"}
                      variant={location.pathname === link.path ? "solid" : "ghost"}
                      _hover={{ bg: "teal.50", color: "teal.600" }}
                      onClick={onClose}
                      transition="all 0.2s ease"
                    >
                      {link.label}
                    </Button>
                  ))}
                </VStack>
              </Box>

              {/* Раздел "Личная библиотека" в мобильном меню */}
              {user && !isAdmin && (
                <Box>
                  <Text fontWeight="bold" color="teal.500" mb={2}>Личная библиотека</Text>
                  <VStack spacing={2} align="stretch">
                    {libraryLinks.map((link) => (
                      <Button
                        as={Link}
                        to={link.path}
                        key={link.path}
                        width="full"
                        justifyContent="flex-start"
                        colorScheme={location.pathname === link.path ? "teal" : "gray"}
                        variant={location.pathname === link.path ? "solid" : "ghost"}
                        _hover={{ bg: "teal.50", color: "teal.600" }}
                        onClick={onClose}
                        transition="all 0.2s ease"
                      >
                        {link.label}
                      </Button>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Раздел "Админ-панель" в мобильном меню */}
              {isAdmin && (
                <Box>
                  <Text fontWeight="bold" color="teal.500" mb={2}>Админ-панель</Text>
                  <VStack spacing={2} align="stretch">
                    {adminLinks.map((link) => (
                      <Button
                        as={Link}
                        to={link.path}
                        key={link.path}
                        width="full"
                        justifyContent="flex-start"
                        colorScheme={location.pathname === link.path ? "teal" : "gray"}
                        variant={location.pathname === link.path ? "solid" : "ghost"}
                        _hover={{ bg: "teal.50", color: "teal.600" }}
                        onClick={onClose}
                        transition="all 0.2s ease"
                      >
                        {link.label}
                      </Button>
                    ))}
                  </VStack>
                </Box>
              )}

              {loading ? (
                <Spinner size="lg" color="teal.500" />
              ) : user ? (
                <>
                  <Button
                    onClick={handleLogout}
                    colorScheme="red"
                    width="full"
                    variant="outline"
                    _hover={{ bg: "red.500", color: "white" }}
                    transition="all 0.2s ease"
                  >
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setIsRegisterOpen(true);
                      onClose();
                    }}
                    colorScheme="teal"
                    width="full"
                    variant="solid"
                    _hover={{ bg: "teal.600" }}
                    transition="all 0.2s ease"
                  >
                    Зарегистрироваться
                  </Button>
                  <Button
                    onClick={() => {
                      setIsLoginOpen(true);
                      onClose();
                    }}
                    colorScheme="cyan"
                    width="full"
                    variant="outline"
                    _hover={{ bg: "cyan.500", color: "white" }}
                    transition="all 0.2s ease"
                  >
                    Войти
                  </Button>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Модальные окна */}
      {isRegisterOpen && (
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />
      )}
      {isLoginOpen && (
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      )}
    </Box>
  );
};

export default Navbar;