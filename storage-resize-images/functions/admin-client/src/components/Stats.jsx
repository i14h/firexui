import React from "react";
import { Line } from "react-chartjs-2";

function Stats() {
  const mockData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Original Size (Cumulative) (GB)",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgba(255, 99, 132, 0.5)",
        lineTension: 0.2,
        data: [100, 110, 130, 160, 200, 250, 350, 500, 750, 1000, 1250, 1800],
      },
      {
        label: "Resized Images (Cumulative) (GB)",
        backgroundColor: "rgb(54, 162, 235)",
        borderColor: "rgba(54, 162, 235, 0.5)",
        lineTension: 0.2,
        data: [30, 35, 40, 50, 70, 90, 120, 166, 250, 333, 416, 666],
      },
    ],
  };

  return (
    <div className="flex mx-60 my-2 px-4 py-2 bg-white shadow-md sm:rounded-md">
      <div className="w-2/3">
        <p className="mb-2 text-xl text-gray-500">Storage Savings</p>
        <div className="h-80 w-full">
          <Line
            data={mockData}
            options={{
              maintainAspectRatio: false,
              title: {
                display: true,
                text: "Average Rainfall per month",
                fontSize: 20,
              },
              legend: {
                display: true,
                position: "right",
              },
            }}
          />
        </div>
        <p className="mt-4 text-justify text-gray-400 text-xs italic">
          * Based on mock data (Real data can be read from Firestore / Firebase
          Storage)
        </p>
      </div>
      <div className="w-1/3 pt-12">
        <p className="text-6xl text-yellow-500 font-semibold tracking-wider">
          240,323
        </p>
        <p className="pt-3 text-3xl text-gray-400 tracking-wider select-none">
          Images Processed
        </p>
        <p className="text-6xl text-green-400 font-semibold pt-20 tracking-wider">
          1,134
        </p>
        <p className="pt-3 text-3xl text-gray-400 tracking-wider select-none">
          Storage Saved (GB)
        </p>
      </div>
    </div>
  );
}

export default Stats;
