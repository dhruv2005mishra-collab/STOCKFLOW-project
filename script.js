function demoItems() {
  return [
    {
      itemId: "I101",
      itemName: "Wireless Mouse",
      supplier: "Logitech",
      category: "Electronics",
      quantity: 12,
      status: "In Stock",
      assignedTo: ""
    },
    {
      itemId: "I102",
      itemName: "Office Chair",
      supplier: "GreenSoul",
      category: "Furniture",
      quantity: 7,
      status: "In Stock",
      assignedTo: ""
    },
    {
      itemId: "I103",
      itemName: "Laptop Stand",
      supplier: "Portronics",
      category: "Accessories",
      quantity: 2,
      status: "Assigned",
      assignedTo: "Aman Sharma (IT Department)"
    },
    {
      itemId: "I104",
      itemName: "USB Keyboard",
      supplier: "Dell",
      category: "Electronics",
      quantity: 3,
      status: "Low Stock",
      assignedTo: ""
    },
    {
      itemId: "I105",
      itemName: "Projector",
      supplier: "Epson",
      category: "Electronics",
      quantity: 1,
      status: "Under Maintenance",
      assignedTo: ""
    },
    {
      itemId: "I106",
      itemName: "Office Desk",
      supplier: "IKEA",
      category: "Furniture",
      quantity: 0,
      status: "Damaged",
      assignedTo: ""
    }
  ];
}

function defaultActivities() {
  return [
    "System initialized with demo inventory records",
    "Role-based admin and visitor access enabled",
    "Quantity tracking and stock status module enabled"
  ];
}

function getItems() {
  let items = localStorage.getItem("items");

  if (items == null) {
    localStorage.setItem("items", JSON.stringify(demoItems()));
    return demoItems();
  }

  let parsed = JSON.parse(items);

  // Auto-upgrade old records that did not have quantity
  parsed.forEach(function(item) {
    if (item.quantity == undefined) {
      item.quantity = item.status == "Assigned" ? 1 : 5;
    }
  });

  saveItems(parsed);
  return parsed;
}

function saveItems(items) {
  localStorage.setItem("items", JSON.stringify(items));
}

function getActivities() {
  let activities = localStorage.getItem("activities");

  if (activities == null) {
    localStorage.setItem("activities", JSON.stringify(defaultActivities()));
    return defaultActivities();
  }

  return JSON.parse(activities);
}

function addActivity(message) {
  let activities = getActivities();
  let time = new Date().toLocaleString();
  activities.unshift(time + " - " + message);

  if (activities.length > 8) {
    activities = activities.slice(0, 8);
  }

  localStorage.setItem("activities", JSON.stringify(activities));
}

function showActivities() {
  let box = document.getElementById("activityList");
  if (!box) return;

  let activities = getActivities();
  box.innerHTML = "";

  activities.forEach(function(activity) {
    box.innerHTML += "<p>• " + activity + "</p>";
  });
}

function getRole() {
  return localStorage.getItem("role");
}

function isAdmin() {
  return getRole() == "admin";
}

function requireLogin() {
  if (!getRole()) {
    window.location.href = "login.html";
  }
}

function requireAdmin() {
  requireLogin();

  if (!isAdmin()) {
    alert("Only admin can access this page.");
    window.location.href = "index.html";
  }
}

function updateAccessUI() {
  let role = getRole();

  if (!role) return;

  let roleBox = document.getElementById("roleBox");
  let roleText = document.getElementById("roleText");
  let profileName = document.getElementById("profileName");
  let profileRole = document.getElementById("profileRole");

  if (roleBox) roleBox.innerHTML = role == "admin" ? "Admin Access" : "Visitor Access";
  if (roleText) {
    roleText.innerHTML = role == "admin"
      ? "You can add, delete, assign and restock items."
      : "You can only view dashboard and inventory records.";
  }

  if (profileName) profileName.innerHTML = role == "admin" ? "Admin User" : "Visitor User";
  if (profileRole) profileRole.innerHTML = role == "admin" ? "Full Inventory Access" : "View Only Access";

  let adminLinks = document.querySelectorAll(".adminOnly");

  adminLinks.forEach(function(link) {
    if (role != "admin") {
      link.classList.add("disabledLink");
      link.onclick = function(e) {
        e.preventDefault();
        showToast("Visitor cannot access admin modules");
      };
    }
  });
}

function adminLogin() {
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();

  if (username == "admin" && password == "1234") {
    localStorage.setItem("role", "admin");
    addActivity("Admin logged in");
    showToast("Admin login successful");

    setTimeout(function() {
      window.location.href = "index.html";
    }, 600);
  } else {
    showToast("Wrong admin username or password");
  }
}

function visitorLogin() {
  localStorage.setItem("role", "visitor");
  addActivity("Visitor entered the website");
  showToast("Visitor access granted");

  setTimeout(function() {
    window.location.href = "index.html";
  }, 600);
}

function logout() {
  addActivity((isAdmin() ? "Admin" : "Visitor") + " logged out");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

function showToast(message) {
  let toast = document.getElementById("toast");

  if (!toast) {
    alert(message);
    return;
  }

  toast.innerHTML = message;
  toast.className = "show";

  setTimeout(function() {
    toast.className = toast.className.replace("show", "");
  }, 2700);
}

function getStatusFromQuantity(quantity) {
  if (quantity <= 0) return "Low Stock";
  if (quantity <= 3) return "Low Stock";
  return "In Stock";
}

function addItem() {
  if (!isAdmin()) {
    showToast("Only admin can add items");
    return;
  }

  let itemId = document.getElementById("itemId").value.trim();
  let itemName = document.getElementById("itemName").value.trim();
  let supplier = document.getElementById("supplier").value.trim();
  let category = document.getElementById("category").value.trim();
  let quantity = Number(document.getElementById("quantity").value);

  if (itemId == "" || itemName == "" || supplier == "" || category == "" || document.getElementById("quantity").value == "") {
    showToast("Please fill all fields");
    return;
  }

  if (quantity < 0) {
    showToast("Quantity cannot be negative");
    return;
  }

  let items = getItems();

  let exists = items.find(function(item) {
    return item.itemId.toLowerCase() == itemId.toLowerCase();
  });

  if (exists) {
    showToast("Item ID already exists");
    return;
  }

  let item = {
    itemId: itemId,
    itemName: itemName,
    supplier: supplier,
    category: category,
    quantity: quantity,
    status: getStatusFromQuantity(quantity),
    assignedTo: ""
  };

  items.push(item);
  saveItems(items);
  addActivity("New item added: " + itemName + " (" + itemId + ")");

  showToast("Item added successfully");

  document.getElementById("itemId").value = "";
  document.getElementById("itemName").value = "";
  document.getElementById("supplier").value = "";
  document.getElementById("category").value = "";
  document.getElementById("quantity").value = "";
}

function statusClass(status) {
  if (status == "In Stock") return "inStock";
  if (status == "Assigned") return "assigned";
  if (status == "Low Stock") return "lowStock";
  if (status == "Under Maintenance") return "maintenance";
  if (status == "Damaged") return "damaged";
  return "inStock";
}

function showItems() {
  requireLogin();
  updateAccessUI();

  let items = getItems();
  let table = document.getElementById("itemTable");
  let search = document.getElementById("search").value.toLowerCase();
  let filterStatus = document.getElementById("filterStatus").value;
  let emptyMessage = document.getElementById("emptyMessage");

  let total = items.length;
  let inStock = items.filter(function(item) {
    return item.status == "In Stock";
  }).length;
  let assigned = items.filter(function(item) {
    return item.status == "Assigned";
  }).length;
  let lowStock = items.filter(function(item) {
    return item.status == "Low Stock";
  }).length;

  if (document.getElementById("pageTotal")) document.getElementById("pageTotal").innerHTML = total;
  if (document.getElementById("pageInStock")) document.getElementById("pageInStock").innerHTML = inStock;
  if (document.getElementById("pageAssigned")) document.getElementById("pageAssigned").innerHTML = assigned;
  if (document.getElementById("pageLowStock")) document.getElementById("pageLowStock").innerHTML = lowStock;

  table.innerHTML = "";
  let count = 0;

  items.forEach(function(item) {
    let text = item.itemId + " " + item.itemName + " " + item.supplier + " " + item.category + " " + item.status;
    let searchMatch = text.toLowerCase().includes(search);
    let statusMatch = filterStatus == "All" || item.status == filterStatus;

    if (searchMatch && statusMatch) {
      count++;

      let actionButton = isAdmin()
        ? `<button class="delete" onclick="deleteItem('${item.itemId}')">Delete</button>`
        : `<span class="viewOnly">View Only</span>`;

      let row = `
        <tr>
          <td><b>${item.itemId}</b></td>
          <td>${item.itemName}</td>
          <td>${item.supplier}</td>
          <td>${item.category}</td>
          <td><b>${item.quantity}</b></td>
          <td><span class="${statusClass(item.status)}">${item.status}</span></td>
          <td>${item.assignedTo || "-"}</td>
          <td>${actionButton}</td>
        </tr>
      `;

      table.innerHTML += row;
    }
  });

  emptyMessage.innerHTML = count == 0 ? "No matching items found." : "";

  let resetButton = document.getElementById("resetButton");
  if (resetButton && !isAdmin()) {
    resetButton.style.display = "none";
  }
}

function assignItem() {
  if (!isAdmin()) {
    showToast("Only admin can assign items");
    return;
  }

  let itemId = document.getElementById("assignItemId").value.trim();
  let employeeName = document.getElementById("employeeName").value.trim();
  let department = document.getElementById("department").value.trim();

  if (itemId == "" || employeeName == "" || department == "") {
    showToast("Please fill all fields");
    return;
  }

  let items = getItems();

  let item = items.find(function(item) {
    return item.itemId.toLowerCase() == itemId.toLowerCase();
  });

  if (!item) {
    showToast("Item not found");
    return;
  }

  if (item.status == "Assigned") {
    showToast("Item is already assigned");
    return;
  }

  if (item.status == "Damaged" || item.status == "Under Maintenance") {
    showToast("Damaged or maintenance items cannot be assigned");
    return;
  }

  if (item.quantity <= 0) {
    showToast("Item quantity is not available");
    return;
  }

  item.status = "Assigned";
  item.assignedTo = employeeName + " (" + department + ")";

  saveItems(items);
  addActivity("Item assigned: " + item.itemName + " to " + employeeName);

  showToast("Item assigned successfully");

  document.getElementById("assignItemId").value = "";
  document.getElementById("employeeName").value = "";
  document.getElementById("department").value = "";
}

function restockItem() {
  if (!isAdmin()) {
    showToast("Only admin can restock items");
    return;
  }

  let itemId = document.getElementById("restockItemId").value.trim();
  let restockQuantity = Number(document.getElementById("restockQuantity").value || 0);

  if (itemId == "") {
    showToast("Please enter Item ID");
    return;
  }

  if (restockQuantity < 0) {
    showToast("Quantity cannot be negative");
    return;
  }

  let items = getItems();

  let item = items.find(function(item) {
    return item.itemId.toLowerCase() == itemId.toLowerCase();
  });

  if (!item) {
    showToast("Item not found");
    return;
  }

  item.quantity = Number(item.quantity || 0) + restockQuantity;
  item.assignedTo = "";

  if (item.status == "Damaged" || item.status == "Under Maintenance") {
    item.status = getStatusFromQuantity(item.quantity);
  } else {
    item.status = getStatusFromQuantity(item.quantity);
  }

  saveItems(items);
  addActivity("Item restocked: " + item.itemName + " | Added Qty: " + restockQuantity);

  showToast("Item restocked successfully");

  document.getElementById("restockItemId").value = "";
  document.getElementById("restockQuantity").value = "";
}

function updateItemStatus() {
  if (!isAdmin()) {
    showToast("Only admin can update item status");
    return;
  }

  let itemId = document.getElementById("statusItemId").value.trim();
  let newStatus = document.getElementById("newStatus").value;

  if (itemId == "") {
    showToast("Please enter Item ID");
    return;
  }

  let items = getItems();
  let item = items.find(function(item) {
    return item.itemId.toLowerCase() == itemId.toLowerCase();
  });

  if (!item) {
    showToast("Item not found");
    return;
  }

  item.status = newStatus;

  if (newStatus != "Assigned") {
    item.assignedTo = "";
  }

  saveItems(items);
  addActivity("Status updated: " + item.itemName + " → " + newStatus);
  showToast("Item status updated successfully");

  document.getElementById("statusItemId").value = "";
}

function deleteItem(itemId) {
  if (!isAdmin()) {
    showToast("Only admin can delete items");
    return;
  }

  let yes = confirm("Delete this item record?");
  if (!yes) return;

  let items = getItems();
  let deleted = items.find(function(item) {
    return item.itemId == itemId;
  });

  items = items.filter(function(item) {
    return item.itemId != itemId;
  });

  saveItems(items);
  if (deleted) addActivity("Item deleted: " + deleted.itemName + " (" + deleted.itemId + ")");

  showToast("Item deleted successfully");
  showItems();
}

function resetItems() {
  if (!isAdmin()) {
    showToast("Only admin can reset data");
    return;
  }

  let yes = confirm("This will restore demo inventory records. Continue?");
  if (!yes) return;

  saveItems(demoItems());
  localStorage.setItem("activities", JSON.stringify(defaultActivities()));
  showToast("Demo inventory restored");
  showItems();
}

function printReport() {
  window.print();
}

function loadHomeStats() {
  requireLogin();
  updateAccessUI();
  showActivities();

  let items = getItems();

  let total = items.length;
  let inStock = items.filter(function(item) {
    return item.status == "In Stock";
  }).length;

  let assigned = items.filter(function(item) {
    return item.status == "Assigned";
  }).length;

  let lowStock = items.filter(function(item) {
    return item.status == "Low Stock";
  }).length;

  document.getElementById("totalItems").innerHTML = total;
  document.getElementById("inStockItems").innerHTML = inStock;
  document.getElementById("assignedItems").innerHTML = assigned;

  if (document.getElementById("lowStockItems")) {
    document.getElementById("lowStockItems").innerHTML = lowStock;
  }

  if (document.getElementById("categoriesCount")) {
    let categories = [];
    items.forEach(function(item) {
      if (!categories.includes(item.category)) categories.push(item.category);
    });
    document.getElementById("categoriesCount").innerHTML = categories.length;
  }

  showCategoryCards();
}

function showCategoryCards() {
  let box = document.getElementById("categoryCards");
  if (!box) return;

  let items = getItems();
  let counts = {};

  items.forEach(function(item) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  box.innerHTML = "";

  Object.keys(counts).forEach(function(category) {
    box.innerHTML += `
      <div class="categoryCard">
        <h3>${category}</h3>
        <p>${counts[category]} item(s)</p>
      </div>
    `;
  });
}