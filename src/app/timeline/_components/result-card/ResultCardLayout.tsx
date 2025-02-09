import { Grid } from "@chakra-ui/react";

const ResultCardLayout = ({ children }) => {
  return (
    <Grid gridTemplateColumns={{ base: "1fr" }} gap={3} mb={3}>
      {children}
    </Grid>
  );
};

export default ResultCardLayout;
