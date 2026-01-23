import PageWrapper from "../PageWrapper";
import { fetchPage } from "../../utils/pageUtils";
import { useEffect, useState, useMemo } from "react";
import { useModelContext } from "../../contexts/ModelContext";
import {
  isFilterActive,
  filterByGender,
  filterByEthnicity,
  filterByInTown,
} from "../../utils/filterUtils";
import { decodeHtmlEntities } from "../../utils/htmlUtils";
import ModelCard from "../ModelCard";
import ModelPopup from "../ModelPopup";

const Models = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const { models, categories } = useModelContext();
  const [activeGender, setActiveGender] = useState("all");
  const [activeEthnicity, setActiveEthnicity] = useState("all");
  const [activeInTown, setActiveInTown] = useState("all");
  const [selectedModel, setSelectedModel] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      const response = await fetchPage();
      response.error ? setError(response.content) : setPage(response.content);
      setIsLoading(false);
    };
    fetchModels();
  }, []);

  // Memoize filtered models to prevent unnecessary re-renders
  const filteredModels = useMemo(() => {
    let filtered = filterByGender(models, activeGender);
    filtered = filterByEthnicity(filtered, activeEthnicity);
    filtered = filterByInTown(filtered, activeInTown);
    return filtered;
  }, [activeGender, activeEthnicity, activeInTown, models]);

  // Memoize filter counts - shows count for each option based on other active filters
  // TODO: Not currently used - can be used to display counts next to filter options (e.g., "Female (5)")
  // eslint-disable-next-line no-unused-vars
  const filterCounts = useMemo(() => {
    // Gender counts (apply ethnicity + inTown filters, then count by gender)
    const genderBase = filterByInTown(
      filterByEthnicity(models, activeEthnicity),
      activeInTown
    );
    const genderCounts = {
      Female: genderBase.filter((m) => m.acf.gender === "Female").length,
      Male: genderBase.filter((m) => m.acf.gender === "Male").length,
      all: genderBase.length,
    };

    // Ethnicity counts (apply gender + inTown filters, then count by ethnicity)
    const ethnicityBase = filterByInTown(
      filterByGender(models, activeGender),
      activeInTown
    );
    const ethnicityCounts = {
      all: ethnicityBase.length,
    };
    categories.forEach((category) => {
      ethnicityCounts[category.id] = ethnicityBase.filter(
        (m) => m.acf.ethnicity === category.id
      ).length;
    });

    // In Town counts (apply gender + ethnicity filters, then count by inTown)
    const inTownBase = filterByEthnicity(
      filterByGender(models, activeGender),
      activeEthnicity
    );
    const inTownCounts = {
      all: inTownBase.length,
      yes: inTownBase.filter((m) => m.acf.in_town === true).length,
      no: inTownBase.filter((m) => m.acf.in_town === false).length,
    };

    return {
      gender: genderCounts,
      ethnicity: ethnicityCounts,
      inTown: inTownCounts,
    };
  }, [models, activeGender, activeEthnicity, activeInTown, categories]);

  return (
    <PageWrapper title={page?.title?.rendered}>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Mobile filter toggle */}
      <button
        className="md:hidden w-full py-3 px-4 mb-4 bg-gray-100 text-left font-semibold flex justify-between items-center"
        onClick={() => setFiltersOpen(!filtersOpen)}
      >
        <span>Filters</span>
        <span className="text-xl">{filtersOpen ? '−' : '+'}</span>
      </button>

      <div className="flex flex-col md:flex-row">
        <div className={`w-full md:w-1/5 ${filtersOpen ? 'block' : 'hidden'} md:block`}>
          <div className="models-page-filters flex flex-col gap-2 sticky top-5 pb-4 md:pb-0">
            {/* Gender Filter */}
            <div className="model-gender-filter flex flex-col gap-2 my-5">
              <h3 className="text-xl font-semibold">Gender</h3>
              <a
                className={`cursor-pointer ${isFilterActive(
                  activeGender,
                  "Female"
                )} hover:no-underline`}
                onClick={() => setActiveGender("Female")}
              >
                WOMEN
              </a>
              <a
                className={`cursor-pointer ${isFilterActive(
                  activeGender,
                  "Male"
                )} hover:no-underline`}
                onClick={() => setActiveGender("Male")}
              >
                MEN
              </a>
              <a
                className={`cursor-pointer ${isFilterActive(
                  activeGender,
                  "all"
                )} no-underline!`}
                onClick={() => setActiveGender("all")}
              >
                ALL
              </a>
            </div>

            {/* Ethnicity Filter */}
            <div className="model-ethnicity-filter flex flex-col gap-2 my-5">
              <h3 className="text-xl font-semibold">Ethnicity</h3>
              <a
                className={`cursor-pointer ${isFilterActive(
                  activeEthnicity,
                  "all"
                )} no-underline!`}
                onClick={() => setActiveEthnicity("all")}
              >
                All
              </a>

              {categories.map((category) => (
                <a
                  key={category.id}
                  className={`cursor-pointer ${isFilterActive(
                    activeEthnicity,
                    category.id
                  )} hover:no-underline`}
                  onClick={() => setActiveEthnicity(category.id)}
                >
                  {decodeHtmlEntities(category.name)}
                </a>
              ))}
            </div>

            {/* In Town Filter */}
            <div className="model-intown-filter flex items-center gap-2 my-5">
              <input
                type="checkbox"
                id="inTownCheckbox"
                className="w-5 h-5"
                checked={activeInTown === "yes"}
                onChange={(e) => setActiveInTown(e.target.checked ? "yes" : "all")}
              />
              <label htmlFor="inTownCheckbox" className="cursor-pointer text-lg">
                In Town?
              </label>
            </div>

            {/* Results Count */}
            <div className="text-lg hidden">
              <span>({filteredModels.length} models)</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-4/5">
          {/* Display filtered models */}
          {filteredModels.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {models.length === 0 ? "Loading models..." : "No models found matching your filters."}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredModels.map((model) => (
                <div key={model.id} className="w-full">
                  <ModelCard model={model} onCardClick={setSelectedModel} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Model Popup */}
      {selectedModel && (
        <ModelPopup
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </PageWrapper>
  );
};

export default Models;
