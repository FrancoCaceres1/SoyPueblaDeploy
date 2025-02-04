import "../create/Create.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import {
  getColor,
  getSizes,
  getCategories,
  getSeries,
} from "../../redux/Actions";
import validations from "./ValidationEdit";
import UploadWidget from "../../componentes/imageUpload/imageUpload";
import CreateDetail from "../create/createDetail/CreateDetail";
import CreateColor from "../create/createColor/createColor";
import CreateSerie from "../create/createSerie/CreateSerie";
import CreateCategory from "../create/createCategory/CreateCategory";
import CreateSize from "../create/createSize/createSize";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useParams } from "react-router-dom";
import Loader from "../../componentes/loader/Loader";

const EditProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const color = useSelector((state) => state.colorList);
  const size = useSelector((state) => state.sizesList);
  const categories = useSelector((state) => state.categories);
  const series = useSelector((state) => state.series);
  const [errors, setErrors] = useState({});
  const [createProduct, setCreateProduct] = useState({
    name: "",
    price: "",
    sale: 0,
    colorImage: [],
    description: "",
    series: [],
    category: [],
  });

  const [showAlert, setShowAlert] = useState({});
  const [dataImages, setDataImages] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const asyncFunction = async () => {
      const { data } = await axios.get(`/products/${id}`);
      setIsReady(true);
      const transformedData = [];

      data.forEach((detail) => {
        const existingColor = transformedData.find(
          (item) => item.color === detail.color
        );

        if (existingColor) {
          existingColor.stocks.push({
            size: detail.size,
            amount: detail.stock,
          });
        } else {
          transformedData.push({
            color: detail.color,
            images: detail.colorImages,
            stocks: [
              {
                size: detail.size,
                amount: detail.stock,
              },
            ],
          });
        }
      });

      setDataImages(transformedData);

      setCreateProduct({
        name: data[0].name,
        price: data[0].price,
        sale: data[0].sale,
        colorImage: transformedData,
        description: data[0].description,
        series: data[0].series.map((s) => s.name),
        category: data[0].category.map((c) => c.name),
      });
    };
    asyncFunction();
  }, [id]);

  const handleCloseAlert = (event) => {
    setShowAlert({});
    event.preventDefault();
  };

  const handleOpenColorCreate = (event) => {
    setShowAlert({ color: true });
    event.preventDefault();
  };

  const handleOpenSerieCreate = (event) => {
    setShowAlert({ serie: true });
    event.preventDefault();
  };

  const handleOpenCategoryCreate = (event) => {
    setShowAlert({ category: true });
    event.preventDefault();
  };

  const handleOpenSizeCreate = (event) => {
    setShowAlert({ size: true });
    event.preventDefault();
  };

  const [uploadedSecureUrl, setUploadedSecureUrl] = useState(null);

  const handleUpload = (url, actualColor) => {
    setUploadedSecureUrl(url);
    setCreateProduct((state) => {
      const updateImages = state.colorImage.map((item)=> {
        if(item.color === actualColor){
          if(dataImages.some(i=> i === item)){
            return {
              ...item,
              images: [url]
            }
          }
          return {
            ...item,
            images: [...item.images, url],
          };
        }
        return item;
      });
      return {
        ...state,
        colorImage: updateImages,
      };
    });
  };

  useEffect(() => {
    if (validations(createProduct)) {
      setErrors(validations(createProduct));
    }

    if (!color.length) {
      dispatch(getColor());
    }
  }, [dispatch, color.length, createProduct]);

  useEffect(() => {
    if (validations(createProduct)) {
      setErrors(validations(createProduct));
    }

    if (!size.length) {
      dispatch(getSizes());
    }
  }, [dispatch, size.length, createProduct]);

  useEffect(() => {
    if (validations(createProduct)) {
      setErrors(validations(createProduct));
    }

    if (!series.length) {
      dispatch(getSeries());
    }
  }, [dispatch, series.length, createProduct]);

  useEffect(() => {
    if (validations(createProduct)) {
      setErrors(validations(createProduct));
    }

    if (!categories.length) {
      dispatch(getCategories());
    }
  }, [dispatch, categories.length, createProduct]);

  const handleChange = (event) => {
    setCreateProduct({
      ...createProduct,
      [event.target.name]: event.target.value,
    });
    setErrors(
      validations({ ...createProduct, [event.target.name]: event.target.value })
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !createProduct.name ||
      !createProduct.description ||
      !createProduct.price ||
      !createProduct.category.length === 0 ||
      !createProduct.series.length === 0 ||
      !createProduct.colorImage.length === 0
    ) {
      alert("Debes llenar todos los campos");
    } else {
      try {
        setIsReady(false);
        await axios.put(`https://soypuebladeploy-production.up.railway.app/products/${id}`, createProduct);
        navigate(`/products/${id}`);
      } catch (error) {
        setIsReady(true);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Ya existe un producto con ese nombre",
          showConfirmButton: false,
        });
      };
    }
  };

  const handleSelect = (event) => {
    setCreateProduct((state) => {
      if (event.target.name === "color") {
        const selectedColor = event.target.value;
        const existingColor = state.colorImage.find(
          (item) => item.color === selectedColor
        );

        if (!existingColor) {
          const updatedColorImage = [
            ...state.colorImage,
            { color: selectedColor, images: [], stocks: [] }, // Agregar stocks vacíos
          ];
          return {
            ...state,
            colorImage: updatedColorImage,
          };
        } else {
          return state;
        }
      }
    });
    setErrors(
      validations({ ...createProduct, [event.target.name]: event.target.value })
    );
  };

  const handleSelectSeries = (event) => {
    setCreateProduct((state) => {
      if (event.target.name === "series") {
        if (!createProduct.series.includes(event.target.value)) {
          return {
            ...state,
            series: [...state.series, event.target.value],
          };
        } else {
          return { ...state, series: [...state.series] };
        }
      }
    });
    setErrors(
      validations({ ...createProduct, [event.target.name]: event.target.value })
    );
  };

  const handleSelectCategories = (event) => {
    setCreateProduct((state) => {
      if (event.target.name === "category") {
        if (!createProduct.category.includes(event.target.value)) {
          return {
            ...state,
            category: [...state.category, event.target.value],
          };
        } else {
          return { ...state, category: [...state.category] };
        }
      }
    });
    setErrors(
      validations({ ...createProduct, [event.target.name]: event.target.value })
    );
  };

  const handleSelectSizeAndStockChange = (event, selectedColor) => {
    const name = event.target.name;
    const value = event.target.value;

    setCreateProduct((state) => {
      if (name === "size") {
        const selectedSize = value;
        const stockItem = state.colorImage
          .find((item) => item.color === selectedColor)
          ?.stocks.find((stock) => stock.size === selectedSize);
        const initialAmount = stockItem ? stockItem.amount : 0;
        if (!stockItem) {
          const updatedColorImage = state.colorImage.map((item) =>
            item.color === selectedColor
              ? {
                  ...item,
                  stocks: [
                    ...item.stocks,
                    { size: selectedSize, amount: initialAmount },
                  ],
                }
              : item
          );
          setErrors(validations({ ...state, colorImage: updatedColorImage }));
          return {
            ...state,
            colorImage: updatedColorImage,
          };
        } else {
          return state;
        }
      } else {
        const color = selectedColor;
        const size = event.target.getAttribute("data-size");
        const newAmount = parseInt(value);
        if (isNaN(newAmount) || newAmount >= 0) {
          const updatedColorImage = state.colorImage.map((item) =>
            item.color === color
              ? {
                  ...item,
                  stocks: item.stocks.map((stock) =>
                    stock.size === size
                      ? { ...stock, amount: newAmount }
                      : stock
                  ),
                }
              : item
          );
          setErrors(validations({ ...state, colorImage: updatedColorImage }));
          return {
            ...state,
            colorImage: updatedColorImage,
          };
        } else {
          return state;
        }
      }
    });
  };

  const handleDeleteColor = (event) => {
    setCreateProduct({
      ...createProduct,
      colorImage: createProduct.colorImage.filter(
        (item) => item.color !== event
      ),
    });
  };

  const handleDeleteSize = (event, color) => {
    setCreateProduct((state) => {
      const updatedColorImage = state.colorImage.map((item) =>
        item.color === color
          ? {
              ...item,
              stocks: item.stocks.filter((sizeObj) => sizeObj.size !== event),
            }
          : item
      );
      return {
        ...state,
        colorImage: updatedColorImage,
      };
    });
  };

  const handleDeleteCategories = (event) => {
    setCreateProduct({
      ...createProduct,
      category: createProduct.category.filter((el) => el !== event),
    });
  };

  const handleDeleteSeries = (event) => {
    setCreateProduct({
      ...createProduct,
      series: createProduct.series.filter((el) => el !== event),
    });
  };

  return (
    <div className="edit-create-main-container">
      {isReady ? (
        <>
          {showAlert.category && (
            <popups className="pop-ups">
              <>
                <div className="transparentBackgroundY"></div>
                <div className="alertContainerY">
                  <p className="alertTextY">Creador de categorías</p>
                  <CreateCategory />
                  <div className="alertButtonsY">
                    <button onClick={handleCloseAlert}>X</button>
                  </div>
                </div>
              </>
            </popups>
          )}
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
          {showAlert.color && (
            <popups className="pop-ups">
              <>
                <div className="transparentBackgroundY"></div>

                <div className="alertContainerY">
                  <p className="alertTextY">Creador de color</p>
                  <CreateColor />
                  <div className="alertButtonsY">
                    <button onClick={handleCloseAlert}>X</button>
                  </div>
                </div>
              </>
            </popups>
          )}
          {showAlert.size && (
            <popups className="pop-ups">
              <>
                <div className="transparentBackgroundY"></div>

                <div className="alertContainerY">
                  <p className="alertTextY">Creador de talle</p>
                  <CreateSize />
                  <div className="alertButtonsY">
                    <button onClick={handleCloseAlert}>X</button>
                  </div>
                </div>
              </>
            </popups>
          )}
          <div className="create-container">
            <form className="create-form">
              <label htmlFor="name">
                Nombre <separator></separator>
              </label>

              <input
                type="string"
                name="name"
                value={createProduct?.name}
                placeholder="Nombre"
                className="custom-input"
                onChange={(event) => handleChange(event)}
              />
              <p className="error">{errors.name}</p>
              <label htmlFor="price">
                Precio <separator></separator>{" "}
              </label>
              <input
                type="number"
                name="price"
                value={createProduct?.price}
                placeholder="Precio"
                className="custom-input"
                onChange={handleChange}
              />
              <p className="error">{errors.price}</p>
              <label htmlFor="sale">
                Descuento %<separator></separator>
              </label>
              <input
                type="number"
                name="sale"
                value={createProduct?.sale}
                placeholder="Descuento %"
                className="custom-input"
                onChange={handleChange}
              />
              <p className="error">{errors.sale}</p>
              <label htmlFor="color">
                Color <separator></separator>{" "}
              </label>

              <div className="buttons-align">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenColorCreate();
                  }}
                  className="mainImage-upload-buttonY "
                >
                  Crear color
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenSizeCreate();
                  }}
                  className="mainImage-upload-buttonY "
                >
                  Crear Talle
                </button>
              </div>

              <select
                name="color"
                placeholder="Colores"
                defaultValue="def"
                onChange={handleSelect}
              >
                <option value="def" key="def" disabled>
                  Selecciona uno o varios colores.
                </option>
                {color.map((el) => {
                  return (
                    <option value={el.name} key={el.id}>
                      {el.name}
                    </option>
                  );
                })}
              </select>
              <p className="error">{errors.color}</p>
              <div>
                {createProduct?.colorImage.length > 0 ? (
                  createProduct?.colorImage.map((col) => {
                    let hexCodex = color.find((c) => c.name === col.color);
                    return (
                      <div>
                        <div key={col.color}>
                          <Accordion
                            style={{
                              boxShadow: "none",
                              width: "400px",
                              margin: "10px",
                              border: "1px solid #aeaeae",
                              backgroundColor: "#FBFBFB",
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <div
                                className="containerBotonesSeleccion"
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  width: "90%",
                                  gap: "25px",
                                }}
                              >
                                <info>
                                  <sample
                                    className="detailColorButtonCreate"
                                    style={{
                                      backgroundColor: hexCodex?.codHex,
                                      width: "20px",
                                      height: "20px",
                                    }}
                                  ></sample>
                                  <p>{col.color}</p>
                                </info>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteColor(col.color)}
                                >
                                  X
                                </button>
                              </div>
                            </AccordionSummary>
                            <AccordionDetails>
                              <div>
                                {col.images.length === 0 ||
                                dataImages.find(
                                  (image) => image.images === col.images
                                )?.images === col.images ? (
                                  <div>
                                    <label htmlFor="image">Imagenes </label>
                                    <UploadWidget
                                      onUpload={(urls) =>
                                        handleUpload(urls, col.color)
                                      }
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <label htmlFor="image">Imagenes </label>
                                    <div>
                                      <button
                                        type="button"
                                        className="mainImage-upload-button"
                                        disabled={true}
                                      >
                                        Imagen cargada
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <talle className="talle">
                                  <label htmlFor="size"> Talles </label>
                                  <select
                                    name="size"
                                    placeholder="Talles"
                                    defaultValue="def"
                                    onChange={(event) =>
                                      handleSelectSizeAndStockChange(
                                        event,
                                        col.color
                                      )
                                    }
                                  >
                                    <option value="def" key="def" disabled>
                                      Selecciona talles
                                    </option>
                                    {size.map((el) => {
                                      return (
                                        <option value={el.name} key={el.id}>
                                          {el.name}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </talle>

                                <div>
                                  {col.stocks.length > 0 ? (
                                    col.stocks.map((si) => {
                                      return (
                                        <div
                                          key={si.size}
                                          className="container-talle-stock"
                                        >
                                          <p>{si.size}</p>
                                          <input
                                            name="amount"
                                            type="number"
                                            data-size={si.size}
                                            value={si.amount}
                                            onChange={(event) =>
                                              handleSelectSizeAndStockChange(
                                                event,
                                                col.color
                                              )
                                            }
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteSize(
                                                si.size,
                                                col.color
                                              )
                                            }
                                          >
                                            X
                                          </button>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="no-dietTypes"></p>
                                  )}
                                </div>
                              </div>
                            </AccordionDetails>
                          </Accordion>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="no-dietTypes"></p>
                )}
              </div>
              <p className="error">{errors.images}</p>
              <p className="error">{errors.size}</p>

              <label htmlFor="series">
                Colección <separator></separator>{" "}
              </label>
              <button
                type="button"
                onClick={() => {
                  handleOpenSerieCreate();
                }}
                className="mainImage-upload-buttonY "
              >
                Crear colección
              </button>
              <select
                name="series"
                placeholder="Coleccion"
                defaultValue="def"
                onChange={handleSelectSeries}
              >
                <option value="def" key="def" disabled>
                  Selecciona colección.
                </option>
                {series.map((el) => {
                  return (
                    <option value={el.name} key={el.id}>
                      {el.name}
                    </option>
                  );
                })}
              </select>
              <p className="error">{errors.series}</p>
              <div className="container-coleccion">
                {createProduct?.series.length > 0 ? (
                  createProduct?.series.map((ser) => (
                    <coleccion key={ser}>
                      <p>{ser}</p>
                      <button onClick={() => handleDeleteSeries(ser)}>X</button>
                    </coleccion>
                  ))
                ) : (
                  <p></p>
                )}
              </div>
              <label htmlFor="category">
                Categoría <separator></separator>{" "}
              </label>
              <button
                type="button"
                onClick={() => {
                  handleOpenCategoryCreate();
                }}
                className="mainImage-upload-buttonY "
              >
                Crear categoría
              </button>
              <select
                name="category"
                placeholder="Categoria"
                defaultValue="def"
                onChange={handleSelectCategories}
              >
                <option value="def" key="def" disabled>
                  Selecciona categoría
                </option>
                {categories.map((el) => {
                  return (
                    <option value={el.name} key={el.id}>
                      {el.name}
                    </option>
                  );
                })}
              </select>
              <p className="error">{errors.category}</p>
              <div className="container-categoria">
                {createProduct?.category.length > 0 ? (
                  createProduct?.category.map((cat) => (
                    <categoria key={cat}>
                      <p>{cat}</p>
                      <button onClick={() => handleDeleteCategories(cat)}>
                        X
                      </button>
                    </categoria>
                  ))
                ) : (
                  <p className="no-dietTypes"></p>
                )}
              </div>
              <label htmlFor="description">
                {" "}
                Descripcion <separator></separator>{" "}
              </label>
              <textarea
                value={createProduct?.description}
                type="text"
                name="description"
                placeholder="Descripcion"
                className="custom-textarea"
                onChange={handleChange}
              />
              <p className="error">{errors.description} </p>
              <label>
                <separator></separator>
              </label>
            </form>
            <separator></separator>
            <div className="div-button">
              <button
                className="submit-button"
                type="submit"
                onClick={handleSubmit}
                disabled={Object.keys(errors).length === 0 ? false : true}
              >
                Editar
              </button>
            </div>
          </div>

          <div>
            <CreateDetail
              nombre={createProduct?.name}
              precio={createProduct?.price}
              serie={createProduct?.series}
              colorImage={createProduct?.colorImage}
              category={createProduct?.category}
              description={createProduct?.description}
              sale={createProduct?.sale}
            />
          </div>
        </>
      ) : (
        <div className="loader-container">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default EditProduct;
