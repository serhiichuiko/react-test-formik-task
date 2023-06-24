import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { City, Speciality, Doctor, FormValues, FilterProps } from "./types";
import { calculateAge } from "../../utils/utils";

import './style.css';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .matches(/^[^0-9]*$/, "Name should not contain numbers"),
  birthday: Yup.string().required("Birthday Date is required"),
  sex: Yup.string().required("Sex is required"),
  city: Yup.string().required("City is required"),
  doctor: Yup.string().required("Doctor is required"),
  contact: Yup.string().test(function (value) {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const mobileRegex = /^[0-9]*$/;

    if (!value) {
      return this.createError({
        path: "contact",
        message: "Email or mobile number is required",
      });
    }

    if (emailRegex.test(value)) {
      return true; // Valid email address
    }

    if (mobileRegex.test(value) && value.length >= 10) {
      return true; // Valid mobile number
    }

    return this.createError({
      path: "contact",
      message: "Invalid email address or mobile number",
    });
  }),
});

const Form: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filters, setFilters] = useState<FilterProps>({});
  const [cityDoctor, setCityDoctor] = useState<City>();
  const [specialtyDoctor, setspecialtyDoctor] = useState<Speciality>();

  useEffect(() => {
    const storedCities = localStorage.getItem("cities");
    if (storedCities) {
      setCities(JSON.parse(storedCities));
    } else {
      axios
        .get("https://run.mocky.io/v3/9fcb58ca-d3dd-424b-873b-dd3c76f000f4")
        .then((response) => {
          setCities(response.data);
          localStorage.setItem("cities", JSON.stringify(response.data));
        })
        .catch((error) => {
          console.error("Error fetching cities:", error);
        });
    }

    const storedSpecialities = localStorage.getItem("specialities");
    if (storedSpecialities) {
      setSpecialities(JSON.parse(storedSpecialities));
    } else {
      axios
        .get("https://run.mocky.io/v3/e8897b19-46a0-4124-8454-0938225ee9ca")
        .then((response) => {
          setSpecialities(response.data);
          localStorage.setItem("specialities", JSON.stringify(response.data));
        })
        .catch((error) => {
          console.error("Error fetching specialities:", error);
        });
    }

    const storedDoctors = localStorage.getItem("doctors");
    if (storedDoctors) {
      setDoctors(JSON.parse(storedDoctors));
    } else {
      axios
        .get("https://run.mocky.io/v3/3d1c993c-cd8e-44c3-b1cb-585222859c21")
        .then((response) => {
          setDoctors(response.data);
          localStorage.setItem("doctors", JSON.stringify(response.data));
        })
        .catch((error) => {
          console.error("Error fetching doctors:", error);
        });
    }
  }, []);

  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      birthday: undefined,
      sex: "",
      city: "",
      speciality: "",
      doctor: "",
      contact: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      console.log(values);
      resetForm();
      setCityDoctor(undefined);
      setspecialtyDoctor(undefined);
      setFilters({});
      alert("Form Submit");
    },
  });

  const handleBirthdayChange = useCallback(
    (date: Date) => {
      formik.setFieldValue("birthday", date);

      const isChild = calculateAge(date) < 18;

      formik.setFieldValue("doctor", "");
      setFilters((prev) => ({ ...prev, isPediatrician: isChild }));
    },
    [formik]
  );

  const handleCityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      formik.handleChange(event);

      const selectedCityId = event.target.value;
      const selectedCity = cities.find(
        (city) => Number(city.id) === Number(selectedCityId)
      );

      setFilters((prev) => ({ ...prev, cityId: selectedCity?.id }));
      formik.setFieldValue("doctor", "");
    },
    [cities, formik]
  );

  const handleSexChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      formik.handleChange(event);

      const selectedSex = event.target.value;
      const filteredSpecialities = specialities?.filter((speciality) => {
        if (selectedSex === "Male") {
          return speciality.params?.gender !== "Female";
        } else if (selectedSex === "Female") {
          return speciality.params?.gender !== "Male";
        } else {
          return true;
        }
      });
      formik.setFieldValue("speciality", "");
      formik.setFieldValue("doctor", "");
      setSpecialities(filteredSpecialities);
    },
    [formik, specialities, setSpecialities]
  );

  const handleSpecialityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      formik.handleChange(event);

      const selectedSpecialityId = event.target.value;
      const selectedSpeciality = specialities.find(
        (speciality) => Number(speciality.id) === Number(selectedSpecialityId)
      );

      formik.setFieldValue("doctor", "");
      setFilters((prev) => ({ ...prev, specialityId: selectedSpeciality?.id }));
    },
    [formik, specialities]
  );

  const handleSelectedDoctor = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      formik.handleChange(event);

      const selectedDoctor = doctors.find(
        (doctor) => Number(doctor.id) === Number(event.target.value)
      );
      setCityDoctor(cities.find((city) => city.id === selectedDoctor?.cityId));
      setspecialtyDoctor(
        specialities.find(
          (specialty) => specialty.id === selectedDoctor?.specialityId
        )
      );
    },
    [doctors, formik, cities, specialities]
  );

  const doctorListFiltered = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return doctors;
    } else {
      return doctors.filter((doctor) => {
        const allFilter = Object.keys(filters);
        const filtteredDoctor = allFilter.map((filter) => {
          if (doctor[filter] === filters[filter]) {
            return true;
          }
          return false;
        });
        return filtteredDoctor.every((element) => element === true);
      });
    }
  }, [filters, doctors]);

  return (
    <form onSubmit={formik.handleSubmit} className="form">
      <div className="field">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
        />
        {formik.touched.name && formik.errors.name ? (
          <div className="error">{formik.errors.name}</div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="birthday">Birthday Date:</label>
        <DatePicker
          id="birthday"
          name="birthday"
          selected={formik.values.birthday}
          onChange={handleBirthdayChange}
          onBlur={formik.handleBlur}
          showYearDropdown
          dateFormat="dd/MM/yyyy"
        />
        {formik.touched.birthday && formik.errors.birthday ? (
          <div className="error">{formik.errors.birthday}</div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="sex">Sex:</label>
        <select
          id="sex"
          name="sex"
          onChange={handleSexChange}
          onBlur={formik.handleBlur}
          value={formik.values.sex}
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {formik.touched.sex && formik.errors.sex ? (
          <div className="error">{formik.errors.sex}</div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="city">City:</label>
        <select
          id="city"
          name="city"
          onChange={handleCityChange}
          onBlur={formik.handleBlur}
          value={formik.values.city}
        >
          <option value="">{cityDoctor ? cityDoctor.name : "Select"}</option>
          {cities?.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        {formik.touched.city && formik.errors.city ? (
          <div className="error">{formik.errors.city}</div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="speciality">Doctor Speciality:</label>
        <select
          id="speciality"
          name="speciality"
          onChange={handleSpecialityChange}
          onBlur={formik.handleBlur}
          value={formik.values.speciality}
        >
          <option value="">
            {specialtyDoctor ? specialtyDoctor.name : "Select"}
          </option>
          {specialities?.map((speciality) => (
            <option key={speciality.id} value={speciality.id}>
              {speciality.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="doctor">Doctor:</label>
        <select
          id="doctor"
          name="doctor"
          onChange={handleSelectedDoctor}
          onBlur={formik.handleBlur}
          value={formik.values.doctor}
        >
          <option value="">Select</option>
          {doctorListFiltered?.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} {doctor.surname}
            </option>
          ))}
        </select>
        {formik.touched.doctor && formik.errors.doctor ? (
          <div className="error">{formik.errors.doctor}</div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="contact">Email / Mobile number:</label>
        <input
          type="text"
          id="contact"
          name="contact"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.contact}
        />
        {formik.touched.contact && formik.errors.contact ? (
          <div className="error">{formik.errors.contact}</div>
        ) : null}
      </div>

      <button type="submit" disabled={!formik.isValid || !formik.dirty} className="submit-btn">
        Submit
      </button>
    </form>
  );
};

export default Form;
