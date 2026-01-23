import ModelCard from "./ModelCard";

const HomeModelsRow = ({ models, modelCardSize, onCardClick }) => {
  return (
    <div
      className="w-auto"
      style={{
        width:
          modelCardSize *
          (models.length > 10 ? Math.ceil(models.length / 2) : 5),
      }}
    >
      {models.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No models found.</p>
      ) : (
        <div className="flex flex-wrap">
          {models.map((model) => (
            <div
              key={model.id}
              style={{ width: `${modelCardSize}px`, flexShrink: 0 }}
            >
              <ModelCard model={model} modelCardSize={modelCardSize} onCardClick={onCardClick} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeModelsRow;
