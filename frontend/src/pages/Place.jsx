import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Text,
  Box,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
  VStack,
  Button,
  HStack,
} from "@chakra-ui/react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import axios from "axios";
import { SearchIcon } from "@chakra-ui/icons";
import { API_BASE_URL } from '../config/JS_apiConfig';

const place = () => {
  const [safeCells, setSafeCells] = useState([]);
  const [selectedCellId, setSelectedCellId] = useState(null);
  const refs = useRef([]);
  const apiKey = "6ad7e365-54e3-4482-81b5-bd65125aafbf";

  // Функция для загрузки данных о безопасных ячейках из API
  const fetchSafeCells = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}api/safeshelves`);
      setSafeCells(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Ошибка при загрузке данных о безопасных ячейках:", error);
    }
  };

  // Загружаем безопасные ячейки при монтировании компонента
  useEffect(() => {
    fetchSafeCells();
  }, []);

  // Обработчик для выбора ячейки из списка
  const handleCardClick = (id) => {
    setSelectedCellId(id);
    scrollToCell(id);
  };

  // Обработчик для клика по метке на карте
  const handlePlacemarkClick = (id) => {
    setSelectedCellId(id);
    scrollToCell(id);
  };

  // Функция для прокрутки к выбранной ячейке
  const scrollToCell = (id) => {
    const index = safeCells.findIndex((cell) => cell.id === id);
    if (index !== -1 && refs.current[index]) {
      refs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // Определяем цвета для светлой и темной темы
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Container maxW="1200px" my={4}>
      <Text fontSize="4xl" fontWeight="bold" mb={4} color={textColor}>
        Безопасные ячейки для книг
      </Text>

      <YMaps query={{ apikey: apiKey }}>
        <Map
          defaultState={{
            center: [53.669353, 23.813131], // Центр карты: Гродно
            zoom: 13,
          }}
          width="100%"
          height="400px"
        >
          {safeCells
            .filter((cell) => cell.latitude && cell.longitude)
            .map((cell) => (
              <Placemark
                key={cell.id}
                geometry={[cell.latitude, cell.longitude]}
                properties={{
                  balloonContent: `
                    <strong>${cell.name}</strong><br/>
                    Адрес: ${cell.address}<br/>
                    Часы работы: ${cell.hours}
                  `,
                  hintContent: cell.name,
                }}
                options={{
                  preset: selectedCellId === cell.id ? "islands#redDotIcon" : "islands#greenDotIcon",
                }}
                onClick={() => handlePlacemarkClick(cell.id)}
              />
            ))}
        </Map>
      </YMaps>

      <Box mt={4}>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Кликните на маркер на карте или выберите ячейку из списка!
        </Text>
      </Box>

      <Box mt={4}>
        <Text fontSize="xl" fontWeight="bold" mb={4} color={textColor}>
          Список безопасных ячеек
        </Text>
        {safeCells.length === 0 ? (
          <Text color={textColor}>Ячейки не найдены</Text>
        ) : (
          <SimpleGrid columns={1} spacing={6}>
            {safeCells.map((cell, index) => (
              <Card
                key={cell.id}
                ref={(el) => (refs.current[index] = el)}
                bg={selectedCellId === cell.id ? "teal.700" : cardBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={selectedCellId === cell.id ? "teal.300" : borderColor}
                _hover={{
                  bg: "teal.600",
                  transform: "translateY(-4px)",
                  transition: "all 0.3s",
                }}
                onClick={() => handleCardClick(cell.id)}
              >
                <CardBody p={6}>
                  <VStack align="start" spacing={4}>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {cell.name}
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      <strong>Адрес:</strong> {cell.address}
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      <strong>Часы работы:</strong> {cell.hours}
                    </Text>
                    <Text fontSize="sm" color={textColor} noOfLines={3}>
                      {cell.description || "Описание отсутствует"}
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

export default place;