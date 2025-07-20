cmake_minimum_required(VERSION 3.10)

project(DecentralizedAI)

# Añadir directorios para headers e incluye
include_directories(include)
link_directories(libs)

# Determinar el sistema operativo y definir flags específicos
if(WIN32)
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -D_WINDOWS")
elseif(APPLE)
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -D_APPLE")
else()
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -D_LINUX")
endif()

# Crear el ejecutable
add_executable(DecentralizedAI 
    src/main.c 
    src/module.c 
    src/network.c 
    src/ocr.c
)

# Enlazar las librerías necesarias (SQLite, OpenSSL, JSON-C)
target_link_libraries(DecentralizedAI sqlite3 ssl crypto json-c)
