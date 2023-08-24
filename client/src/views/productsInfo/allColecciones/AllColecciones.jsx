import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSeries, deleteSeries, putSeries } from "../../../redux/Actions";
import { FaPencilAlt } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { NavLink, useNavigate } from "react-router-dom";
import CreateSerie from "../../create/createSerie/CreateSerie";
import Swal from "sweetalert2";
// import SearchBar from '../../../componentes/searchBar/SearchBar';

import "./AllColecciones.css";

const AllColecciones = () => {
  const series = useSelector((state) => state.series);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState({});
  // const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getSeries());
    };

    fetchData();
  }, [dispatch]);

  const handleDeleteSeries = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás segura?",
      text: "Una vez eliminado, se borrará automáticamente y afectará el funcionamiento de los productos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#517f7f",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínala",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteSeries(id));
        await dispatch(getSeries());

        Swal.fire({
          title: "Eliminado",
          text: "La serie ha sida eliminada.",
          icon: "success",
          confirmButtonColor: "#517f7f",
        });
      } catch (error) {
        console.error("Error al eliminar la serie:", error);
        Swal.fire(
          "Error",
          "Ha ocurrido un error al eliminar la serie.",
          "error"
        );
      }
    }
  };

  const handleEditSeries = async (id, name, image) => {
    const updatedName = prompt("Enter new name", name);
    if (updatedName) {
      await dispatch(putSeries(id, updatedName, image));
      dispatch(getSeries());
    }
  };

  const handleCloseAlert = (event) => {
    setShowAlert({});
    event.preventDefault();
  };

  const handleOpenSerieCreate = (event) => {
    setShowAlert({ serie: true });
    event.preventDefault();
  };

  return (
    <div className="coleccion-main-admin" name="series" value="name">
      <button
        type="button"
        onClick={() => {
          handleOpenSerieCreate();
        }}
        className="mainImage-upload-buttonY"
      >
        Crear colección
      </button>
      <div className="coleccion-admin">
        <h2 className="coleccion-title-admin">Colecciones disponibles</h2>
        {Array.isArray(series) &&
          series.map((el) => (
            <div key={el.id} className="coleccion-item-admin">
              <h2 className="coleccion-name-admin">{el.name}</h2>
              <div className="icons-coleccion-admin">
                <button
                  onClick={() => handleEditSeries(el.id, el.name, el.image)}
                >
                  <FaPencilAlt />
                </button>
                <button
                  className="delete-color-admin"
                  onClick={() => handleDeleteSeries(el.id)}
                >
                  {<RiDeleteBin6Line />}
                </button>
              </div>
            </div>
          ))}
      </div>
      {showAlert.serie && (
        <popups className="pop-ups">
          <>
            <div className="transparentBackgroundY"></div>
            <div className="alertContainerY">
              <p className="alertTextY">Creador de colecciones</p>
              <CreateSerie />
              <div className="alertButtonsY">
                <button onClick={handleCloseAlert}>X</button>
              </div>
            </div>
          </>
        </popups>
      )}
    </div>
  );
};

export default AllColecciones;
