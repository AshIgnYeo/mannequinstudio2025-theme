import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageWrapper from "./PageWrapper";
import { fetchPage } from "../utils/pageUtils";

const Page = () => {
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      const result = await fetchPage();

      if (result.error) {
        setError(result.content);
        setPage(null);
      } else {
        setPage(result.content);
        setError(null);
      }

      setIsLoading(false);
    };

    loadPage();
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          className="h-screen flex w-full items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        ></motion.div>
      ) : (
        <PageWrapper title={page?.title?.rendered}>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            // WordPress REST API sanitizes content before rendering
            // Using dangerouslySetInnerHTML here to preserve editor formatting
            <div
              dangerouslySetInnerHTML={{ __html: page?.content?.rendered }}
            />
          )}
        </PageWrapper>
      )}
    </AnimatePresence>
  );
};

export default Page;
