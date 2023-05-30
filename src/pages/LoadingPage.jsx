import React from "react";
import { ThreeDots } from "react-loader-spinner";

const LoadingPage = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <ThreeDots
        height="40"
        width="40"
        radius="9"
        color="#4b7fdf"
        ariaLabel="three-dots-loading"
        wrapperStyle={{}}
        wrapperClassName=""
        visible={true}
      />
    </div>
  );
};

export default LoadingPage;
