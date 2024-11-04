$(function () {
  var data = {
    name: $("#name").val(),
    amount: $("#amount").val(),
  };

  $("#myForm").on("submit", function (event) {
    event.preventDefault();
    const formData = {
      name: $('input[name="name"]').val(),
      amount: $('input[name="amount"]').val(),
    };

    // if ($(this).attr("value") == "button-1") {
      $.ajax({
        type: "POST",
        url: "http://localhost:3000/submit1",
        data: JSON.stringify(formData),
        contentType: "application/json",
        success: function (response) {
          console.log(response);
        },
        error: function (error) {
          console.error("Error:", error);
        },
      });
    // }
    fetchData();
  });

  $("#myDeleteForm").on("submit", function (event) {
    console.log("clicked");
    event.preventDefault();
    const formData = {
      name: $('input[name="name2"]').val(),
    };

    // if ($(this).attr("value") == "button-2") {
      $.ajax({
        type: "DELETE",
        url: "http://localhost:3000/submit2",
        data: JSON.stringify(formData),
        contentType: "application/json",
        success: function (response) {
          console.log(response);
        },
        error: function (error) {
          console.error("Error:", error);
        },
      });
    // }
    // window.location.href=("http://localhost:3000/index.html");
    fetchData();
  });

  fetchData();

  function fetchData() {
    $.ajax({
      url: "/api/pills",
      method: "GET",
      dataType: "json",
      success: function (data) {
        displayData(data);
      },
      error: function (xhr, status, error) {
        console.error("AJAX Error:", status, error);
      },
    });
  }

  $("#delete-medication").on("click", function () {
    window.location.href = "http://localhost:3000/delete_med.html";
  });

  let counter = 1;

  function displayData(data) {
    const container = $("#data-container");
    container.empty(); // Clear previous content

    $.each(data, function (index, item) {
      $("#data-container").append(
        `
        <tr><td>${item.name}</td><td>${item.amount}</td>
        <!-- <td><button class="delete-button" data-index="${counter++}">X</button></td> -->
        </tr>
        `
      );
    });
  }

  // $("#data-container").on("click", ".delete-button", function () {
  //   const id = $(this).data("index"); // Get the index from the button
  //   console.log("Deleting item with ID:", id);

  //   $.ajax({
  //     url: `/api/pills/${id}`, // Replace with your actual API endpoint
  //     type: "DELETE",
  //     success: function (response) {
  //       // Optionally, you can handle the response
  //       console.log("Item deleted successfully:", response);
  //       // Refresh the data display
  //       fetchData(); // Call a function to refresh your data
  //     },
  //     error: function (error) {
  //       console.error("Error deleting item:", error);
  //       alert("Could not delete the item. Please try again.");
  //     },
  //   });
  // });

  // $("#clear").on("click", function () {
  //   $.ajax({
  //     type: "DELETE",
  //     url: "/api/pills",
  //     data: data,
  //     success: function (response) {
  //       console.log("Data deleted successfully:", response);
  //     },
  //     error: function (error) {
  //       console.error("Error deleting data:", error);
  //     },
  //   });

  //   fetchData();
  // });
});
