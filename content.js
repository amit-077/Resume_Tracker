document.addEventListener("mouseup", function () {
    removeExistingButton();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    let selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const button = document.createElement("button");
        button.innerText = "Copy Link";
        button.id = "text-select-btn";
        button.className = "text-select-btn";

        // Style the button
        button.style.position = "absolute";
        button.style.top = `${rect.bottom + window.scrollY + 5}px`;
        button.style.left = `${rect.left + window.scrollX}px`;
        button.style.zIndex = "1000";
        button.style.padding = "8px 12px";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.background = "#5580e9";
        button.style.color = "white";
        button.style.cursor = "pointer";
        button.style.fontSize = "14px";
        button.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";

        document.body.appendChild(button);

        // ✅ Remove existing listener before adding a new one
        document.removeEventListener("click", handleOutsideClick);
        setTimeout(() => {
            document.addEventListener("click", handleOutsideClick);
        }, 10);

        button.addEventListener("mousedown", function (event) {
            event.preventDefault(); // Prevent losing selection

            // Fetch user data from Chrome storage
            chrome?.storage?.local.get("userData", function (result) {
                if (result.userData) {
                    fetch("https://pingit.vercel.app/short", {
                        method: "POST",
                        mode: "cors", // Ensures cross-origin requests
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                        body: JSON.stringify({
                            companyName: selectedText,
                            email: result?.userData?.input1,  // Ensure safe access
                            resumeLink: result?.userData?.input2
                        }),
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then((data) => {
                        if (data?.shortURL) {
                            navigator.clipboard.writeText(data.shortURL);
                            showToast("Copied!!", false);
                        } else {
                            console.error("No shortURL in response:", data);
                        }
                    })
                    .catch(error => console.error("Fetch error:", error));
                    

                    setTimeout(() => {
                        removeExistingButton();
                    }, 50);
                } else {
                    showToast("No data found!", true);
                }
            });
        });
    }
});

// ✅ Function to remove existing button
function removeExistingButton() {
    let existingButton = document.getElementById("text-select-btn");
    if (existingButton) existingButton.remove();
}

// ✅ Function to hide button when clicking elsewhere
function handleOutsideClick(event) {
    let button = document.getElementById("text-select-btn");
    if (button && event.target !== button) {
        removeExistingButton();
        document.removeEventListener("click", handleOutsideClick);
    }
}

// ✅ Function to show toast notification
function showToast(message, isError) {
    let toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = isError ? "#ff4d4d" : "white";
    toast.style.color = isError ? "white" : "#5580e9";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "bold";
    toast.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    toast.style.zIndex = "10000";
    toast.style.opacity = "1";
    toast.style.transition = "opacity 0.5s ease-in-out";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
}
