import React, {
  forwardRef,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  useState,
} from "react";
import Select, { components } from "react-select";
import { musicGenresList } from "../../utils/Genres.js";
import { getKeyFromPitchClass, getPitchClassFromKey } from "../../utils/Pitch";
import { getFilteredSearchMessage } from "../../utils/StatusBarMessage";

const FilteredSearch = forwardRef(
  (
    { token, getRecosFromFilteredSearch, resetSearch, updateStatusBar },
    ref,
  ) => {
    // const [allGenres, setAllGenres] = useState(musicGenresList);

    const selectedGenreRef = useRef(null);
    const selectedTempoRef = useRef(null);
    const selectedKeyRef = useRef(null);

    const allGenres = musicGenresList;

    const genresOptions = useMemo(
      () =>
        allGenres.map((genre) => ({
          value: genre,
          label: genre,
        })),
      [allGenres],
    );

    const tempoOptions = useMemo(
      () => [
        { value: "all", label: "all" },
        ...Array.from({ length: 161 }, (_, index) => ({
          value: index + 60,
          label: index + 60,
        })),
      ],
      [],
    );

    const keyOptions = useMemo(
      () => [
        { value: "all", label: "all" },
        ...Array.from({ length: 12 }, (_, index) => ({
          value: index,
          label: getKeyFromPitchClass(index),
        })),
      ],
      [],
    );

    const handleGenreChange = useCallback((selectedOption) => {
      selectedGenreRef.current = selectedOption ? selectedOption.value : null;
    }, []);

    const handleTempoChange = useCallback((selectedOption) => {
      selectedTempoRef.current = selectedOption ? selectedOption.value : null;
    }, []);

    const handleKeyChange = useCallback((selectedOption) => {
      selectedKeyRef.current = selectedOption ? selectedOption.value : null;
    }, []);

    const resetFilteredSearch = useCallback(() => {
      selectedGenreRef.current = null;
      selectedTempoRef.current = null;
      selectedKeyRef.current = null;
    }, []);

    // Expose the resetFilteredSearch function to the parent component
    useImperativeHandle(ref, () => ({
      resetFilteredSearch,
    }));

    const customStyles = {
      control: (provided) => ({
        ...provided,
        margin: "0.2em",
        fontSize: "0.9em",
        width: "9em",
        borderRadius: "4px",
        border: "1px solid #d4a373",
        boxShadow: "1px 1px 1px 1px #d4a373",
      }),
      placeholder: (provided, state) => ({
        ...provided,
        fontWeight: state.selectProps.value ? "bold" : "normal",
      }),
      indicatorSeparator: () => ({
        display: "none",
      }),
      dropdownIndicator: (provided, state) => ({
        ...provided,
        transition: "transform 0.2s",
        transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
      }),
      clearIndicator: (provided) => ({
        ...provided,
        cursor: "pointer",
      }),
    };

    const handleClearIndicatorClick = () => {
      resetFilteredSearch();
      resetSearch();
      updateStatusBar("///");
    };

    const ClearIndicator = useCallback(
      (props) => {
        const { innerProps } = props;
        const handleClearIndicatorClick = () => {
          if (
            selectedGenreRef.current ||
            selectedTempoRef.current ||
            selectedKeyRef.current
          ) {
            resetFilteredSearch();
            resetSearch();
            updateStatusBar("///");
          }
        };

        return (
          <div {...innerProps}>
            <button
              style={{ fontSize: "0.6em" }}
              onClick={handleClearIndicatorClick}
            >
              X
            </button>
          </div>
        );
      },
      [resetFilteredSearch, resetSearch, updateStatusBar],
    );

    const DropdownIndicator = useCallback((props) => {
      const { selectProps } = props;
      return (
        <components.DropdownIndicator {...props}>
          {selectProps.menuIsOpen ? <span>&#9650;</span> : <span>&#9660;</span>}
        </components.DropdownIndicator>
      );
    }, []);

    const customComponents = useMemo(
      () => ({
        ClearIndicator: React.memo(ClearIndicator),
        DropdownIndicator: React.memo(DropdownIndicator),
      }),
      [ClearIndicator, DropdownIndicator],
    );

    const RenderGenresDropdown = useMemo(() => {
      return (
        <Select
          className="search-dropdown genres-dropdown"
          styles={customStyles}
          options={genresOptions}
          onChange={handleGenreChange}
          isClearable={true}
          placeholder={
            selectedGenreRef.current ? selectedGenreRef.current : "Genre"
          }
          components={customComponents}
        />
      );
    }, [customStyles, genresOptions, handleGenreChange, customComponents]);

    const RenderTempoDropDown = useMemo(() => {
      return (
        <Select
          className="search-dropdown tempo-dropdown"
          styles={customStyles}
          options={tempoOptions}
          onChange={handleTempoChange}
          isClearable={true}
          placeholder={
            selectedTempoRef.current ? selectedTempoRef.current : "BPM"
          }
          components={customComponents}
        />
      );
    }, [customStyles, tempoOptions, handleTempoChange, customComponents]);

    const RenderKeyDropDown = useMemo(() => {
      return (
        <Select
          className="search-dropdown key-dropdown"
          styles={customStyles}
          options={keyOptions}
          onChange={handleKeyChange}
          isClearable={true}
          placeholder={
            getKeyFromPitchClass(selectedKeyRef.current)
              ? getKeyFromPitchClass(selectedKeyRef.current)
              : "Key"
          }
          components={customComponents}
        />
      );
    }, [customStyles, keyOptions, handleKeyChange, customComponents]);

    const filterSearch = useCallback(
      (e) => {
        e.preventDefault();
        resetSearch();
        if (selectedGenreRef.current) {
          updateStatusBar(
            getFilteredSearchMessage(
              selectedGenreRef.current,
              selectedTempoRef.current,
              selectedKeyRef.current,
            ),
          );
        }
        getRecosFromFilteredSearch(
          selectedGenreRef.current,
          selectedTempoRef.current,
          selectedKeyRef.current,
        );
      },
      [
        resetSearch,
        updateStatusBar,
        getRecosFromFilteredSearch,
        selectedGenreRef,
        selectedTempoRef,
        selectedKeyRef,
      ],
    );

    return (
      <form onSubmit={filterSearch} id="search-form">
        {RenderGenresDropdown}
        {RenderTempoDropDown}
        {RenderKeyDropDown}
        <button
          id="filter-search-button"
          className="search-button"
          type={"submit"}
        >
          Search
        </button>
        <button onClick={handleClearIndicatorClick}>Clear</button>
      </form>
    );
  },
);

export default FilteredSearch;
