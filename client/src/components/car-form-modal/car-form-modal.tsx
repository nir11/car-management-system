import React, { FC, useState } from "react";
import { Button } from "react-bootstrap";
import "./car-form-modal.scss";
import { Car } from "../../interfaces/car";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface Props {
  initialCar: Car | null;
  setCars: any;
  close: () => void;
}

export const CarFormModal: FC<Props> = ({ initialCar, setCars, close }) => {
  const [loading, setLoading] = useState(false);
  const [car, setCar] = useState<Car>({
    licensePlateNumber: initialCar?.licensePlateNumber || "",
    color: initialCar?.color || "",
    manufacturer: initialCar?.manufacturer || "",
    model: initialCar?.model || "",
    year: initialCar?.year || 0,
    active: initialCar?.active || true,
  });

  const [errors, setErrors] = useState(
    Array.from({ length: Object.keys(car).length }, () => ({
      show: false,
      text: "",
    }))
  );

  const [serverError, setServerError] = useState({
    show: false,
    text: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log({ errors });
    console.log("name", e.target.name);
    console.log("value", e.target.value);

    setCar((prevCar) => ({
      ...prevCar,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    console.log("before validate");
    if (!validate()) return;
    console.log("after validate");

    setLoading(true);
    if (initialCar) {
      updateCar();
    } else {
      createCar();
    }
  };

  const validate = (): boolean => {
    let newErrors = Array.from({ length: Object.keys(car).length }, () => ({
      show: false,
      text: "",
    }));

    // check if license plate number exists
    if (car.licensePlateNumber.replace(/\s/g, "").length === 0) {
      newErrors[Object.keys(car).indexOf("licensePlateNumber")] = {
        show: true,
        text: "Empty fld",
      };
    }
    // check if license plate number contains characters and/or numbers only
    else if (!/^[a-zA-Z0-9]+$/.test(car.licensePlateNumber)) {
      newErrors[Object.keys(car).indexOf("licensePlateNumber")] = {
        show: true,
        text: "The field must contain only characters and number",
      };
    }
    if (car.color.replace(/\s/g, "").length === 0) {
      newErrors[Object.keys(car).indexOf("color")] = {
        show: true,
        text: "Empty fld",
      };
    }

    if (car.manufacturer.replace(/\s/g, "").length === 0) {
      newErrors[Object.keys(car).indexOf("manufacturer")] = {
        show: true,
        text: "Empty fld",
      };
    }

    if (car.model.replace(/\s/g, "").length === 0) {
      newErrors[Object.keys(car).indexOf("model")] = {
        show: true,
        text: "Empty fld",
      };
    }
    if (car.year == 0) {
      newErrors[Object.keys(car).indexOf("year")] = {
        show: true,
        text: "Empty fld",
      };
    }
    setErrors(newErrors);

    if (newErrors.some((err) => err.show)) {
      return false;
    }
    return true;
  };

  const updateCar = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/cars/${car.licensePlateNumber}`,
        car
      );
      const { error, success } = response.data;
      if (success) {
        setCars((prevCars: Car[]) => {
          const updatedCars = prevCars.map((prevCar: Car) =>
            prevCar.licensePlateNumber === car.licensePlateNumber
              ? car
              : prevCar
          );
          return updatedCars;
        });
        close();
      } else {
        if (error.code === 2) {
          // Car already exists error
          setServerError({
            show: true,
            text: "License plate number already exists in system",
          });
        } else console.log(error);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const createCar = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/cars`,
        car
      );
      const { error, payload, success } = response.data;
      if (success) {
        setCars((prevCars: Car[]) => {
          const newCars = [...prevCars];
          newCars.push(car);
          newCars.sort((a: Car, b: Car) =>
            a.licensePlateNumber.localeCompare(b.licensePlateNumber)
          );
          return newCars;
        });
        close();
      } else {
        if (error.code === 2) {
          // Car already exists error
          setServerError({
            show: true,
            text: "License plate number already exists in system",
          });
        } else console.log(error);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const range = (start: number, end: number): number[] => {
    return Array(end - start + 1)
      .fill(0)
      .map((_, idx) => start + idx);
  };

  return (
    <Modal
      show
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Dialog style={{ margin: "0" }}>
        <Modal.Header closeButton onClick={close}>
          <Modal.Title>{initialCar ? "Update" : "New"} Car</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="car-form-container">
            <form onSubmit={handleSubmit} noValidate>
              <div className="info-wrapper ">
                <div className="input-and-label-container">
                  <label>License plate number</label>
                  <input
                    type="text"
                    name="licensePlateNumber"
                    value={car.licensePlateNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <p
                className="field-error"
                style={{
                  visibility: errors[
                    Object.keys(car).indexOf("licensePlateNumber")
                  ].show
                    ? "visible"
                    : "hidden",
                }}
              >
                * {errors[Object.keys(car).indexOf("licensePlateNumber")].text}
              </p>
              <div className="info-wrapper ">
                <div className="input-and-label-container">
                  <label>Color</label>
                  <Form.Control
                    as="select"
                    name="color"
                    aria-label="Select color"
                    value={car.color}
                    onChange={handleChange}
                  >
                    <option value="">Choose color...</option>
                    <option value="Red">Red</option>
                    <option value="Green">Green</option>
                    <option value="Silver">Silver</option>
                  </Form.Control>
                </div>
              </div>
              <p
                className="field-error"
                style={{
                  visibility: errors[Object.keys(car).indexOf("color")].show
                    ? "visible"
                    : "hidden",
                }}
              >
                * {errors[Object.keys(car).indexOf("color")].text}
              </p>
              <div className="info-wrapper ">
                <div className="input-and-label-container">
                  <label>Manufacturer</label>
                  <Form.Control
                    as="select"
                    name="manufacturer"
                    aria-label="Select manufacturer"
                    value={car.manufacturer}
                    onChange={handleChange}
                  >
                    <option value="">Choose manufacturer...</option>
                    <option value="BMW">BMW</option>
                    <option value="Audi">Audi</option>
                    <option value="Volkswagen">Volkswagen</option>
                  </Form.Control>
                </div>
              </div>
              <p
                className="field-error"
                style={{
                  visibility: errors[Object.keys(car).indexOf("manufacturer")]
                    .show
                    ? "visible"
                    : "hidden",
                }}
              >
                * {errors[Object.keys(car).indexOf("manufacturer")].text}
              </p>
              <div className="info-wrapper ">
                <div className="input-and-label-container">
                  <label>Model</label>
                  <input
                    type="text"
                    name="model"
                    value={car.model}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <p
                className="field-error"
                style={{
                  visibility: errors[Object.keys(car).indexOf("model")].show
                    ? "visible"
                    : "hidden",
                }}
              >
                * {errors[Object.keys(car).indexOf("model")].text}
              </p>
              <div className="info-wrapper ">
                <div className="input-and-label-container">
                  <label>Year</label>
                  <Form.Control
                    as="select"
                    name="year"
                    aria-label="Select year"
                    value={car.year}
                    onChange={handleChange}
                  >
                    <option value={0}>Choose year...</option>
                    {range(2010, 2021).map((year: number) => (
                      <option value={year}>{year}</option>
                    ))}
                  </Form.Control>
                </div>
              </div>
              <p
                className="field-error"
                style={{
                  visibility: errors[Object.keys(car).indexOf("year")].show
                    ? "visible"
                    : "hidden",
                }}
              >
                * {errors[Object.keys(car).indexOf("year")].text}
              </p>
              <p
                className="server-error"
                style={{
                  visibility: serverError.show ? "visible" : "hidden",
                }}
              >
                * {serverError.text}
              </p>

              <div className="bottom-buttons-container">
                <Button variant="primary" type="submit">
                  Save
                  {loading && (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin={true}
                      style={{ marginRight: "10px" }}
                    />
                  )}
                </Button>
                <Button variant="secondary" onClick={close}>
                  Close
                </Button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal.Dialog>
    </Modal>
  );
};
