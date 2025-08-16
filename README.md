# Electrical Toolbox

```
.----------------------------------------------------.
| _____  _              _          _              _  |
|| ____|| |  ___   ___ | |_  _ __ (_)  ___  __ _ | | |
||  _|  | | / _ \ / __|| __|| '__|| | / __|/ _` || | |
|| |___ | ||  __/| (__ | |_ | |   | || (__| (_| || | |
||_____||_| \___| \___| \__||_|   |_| \___|\__,_||_| |
|     _____              _  _                        |
|    |_   _|___    ___  | || |__    ___ __  __       |
|      | | / _ \  / _ \ | || '_ \  / _ \\ \/ /       |
|      | || (_) || (_) || || |_) || (_) |>  <        |
|      |_| \___/  \___/ |_||_.__/  \___//_/\_\       |
'----------------------------------------------------'
```

**Electrical Toolbox** is an open-source electrical playground designed to help engineers, students, and hobbyists simulate and design electrical circuits with ease. This tool provides an intuitive interface for creating, analyzing, and visualizing electrical systems.

---

## Features

- **Interactive Canvas**: 🖌️ Drag and drop components to design circuits.
- **Component Library**: 📚 Access a wide range of electrical components.
- **Netlist Generation**: 📝 Export your circuit design as a netlist.
- **BOM (Bill of Materials)**: 📋 Automatically generate a BOM for your project.
- **Custom Components**: 🛠️ Create and use your own components.

---

## Getting Started

Follow these steps to set up and run the project locally:

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kalaajiahmad/electrical-toolbox.git
   ```

2. Navigate to the project directory:
   ```bash
   cd electrical-toolbox
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to view the application.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push them to your fork.
4. Submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions or feedback, please reach out to [Ahmad Kalaaji](mailto:kalaajiahmad@outlook.com).

---

### Screenshots

#### Interactive Canvas
```
+-----------------------+
|       Canvas          |
|  [ Resistor ]         |
|  [ Capacitor ]        |
|  [ Wire ]             |
+-----------------------+
```

#### Component Library
```
+-----------------------+
| Component Library     |
|  - Resistor           |
|  - Capacitor          |
|  - Inductor           |
+-----------------------+
```

#### Netlist Example
```
*Netlist Example*
R1 1 2 100k
C1 2 0 10uF
V1 1 0 DC 5V
```

#### BOM Example
```
+-----------------------+
| Bill of Materials     |
|  - Resistor: 2 pcs    |
|  - Capacitor: 1 pcs   |
+-----------------------+
```
