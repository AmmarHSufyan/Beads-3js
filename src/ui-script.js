//import beads json
import { add } from 'three/tsl';
import beadsJSON from './beads.json';

let stepHistory = [];
let currentStep = 0; // 0: Circumference selection, 1: Cord selection, 2: Beads selection

// function escapeSingleQuotes(str) {
window.escapeSingleQuotes = function (str) { 
   let string = str.replace(/'/g, "&#39;"); 

   return string;
}

window.toggleOverlay = function () {
    document.getElementById('overlaySidebar').classList.toggle('open');
}

window.toggleSection = function (sectionId) {


    let sections = document.querySelectorAll('.hidden-section');
    sections.forEach(section => {
        if (section.id !== sectionId) {
            section.style.display = 'none';
        }
    });

    let section = document.getElementById(sectionId);
    if (section.style.display === 'block') {
        section.style.display = 'none';
    } else {
        section.style.display = 'block';
    }
}

document.getElementById("canvasToggleButton").addEventListener("click", function () {
    let buttonContainer = document.querySelector(".bottom-left-button-container");
    let buttonRows = document.querySelectorAll(".button-row-hidden");

    let isMobile = window.innerWidth <= 768; // Check if it's mobile
    let isExpanded = Array.from(buttonRows).some(row => row.style.display === "flex");

    if (isExpanded) {
        buttonRows.forEach(row => row.style.display = "none");
        if (isMobile) {
            buttonContainer.style.transform = "translateY(0)"; // Reset position only on mobile
        }
    } else {
        buttonRows.forEach(row => row.style.display = "flex");
        if (isMobile) {
            buttonContainer.style.transform = "translateY(-60px)"; // Move up only on mobile
        }
    }
});


window.selectOption = function (element) {

    let options = document.querySelectorAll('.selectable');
    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
}

window.selectWrapOption = function (element) {
    // Highlight the selected wrap button
    let options = document.querySelectorAll('.selectable-wrap');
    options.forEach(opt => opt.classList.remove('selected-wrap'));
    element.classList.add('selected-wrap');

    // Determine the selected wrap number
    let wrapNumber = element.textContent.trim();

    // Hide all selectable divs
    let allSelectables = document.querySelectorAll('.selectable');
    allSelectables.forEach(div => div.style.display = 'none');

    // Show only the divs with the matching data-wrap attribute
    let matchingDivs = document.querySelectorAll(`.selectable[data-wrap="${wrapNumber}"]`);
    matchingDivs.forEach(div => div.style.display = 'block');
};

// function changeSidebarContent() {
window.changeSidebarContent = function () {
    // Cord selection state (from circumference selection)
    let sidebarBody = document.getElementById('sidebarBody');
    stepHistory.push(sidebarBody.innerHTML);
    sidebarBody.classList.add('hidden');

    setTimeout(() => {
        sidebarBody.innerHTML = `
            <button class="back-btn" onclick="goBackAndUpdateStep()">&#8592; Back</button>
            <p class="sidebar-body-main-heading">Please select the bracelet cord</p>
            <div class="card-container">
                <div class="card" onclick="selectCard(this)">
                    <img src="images/cord1.jpeg" alt="Cord 1">
                    <div class="card-content">
                        <h6>Classic Cord</h6>
                        <div class="color-options">
                            <span style="background: red;"></span>
                            <span style="background: blue;"></span>
                            <span style="background: black;"></span>
                        </div>
                        <p>A durable and stylish cord for everyday wear.</p>
                    </div>
                </div>
                <div class="card" onclick="selectCard(this)">
                    <img src="images/cord1.jpeg" alt="Cord 2">
                    <div class="card-content">
                        <h6>Premium Cord</h6>
                        <div class="color-options">
                            <span style="background: green;"></span>
                            <span style="background: yellow;"></span>
                            <span style="background: white;"></span>
                        </div>
                        <p>Luxurious and elegant, made from high-quality materials.</p>
                    </div>
                </div>
            </div>
        `;
        sidebarBody.classList.remove('hidden');
        document.querySelector('.back-btn').style.display = 'block';
        // document.querySelectorAll('.card-content').forEach(el => {el.style.display ='block';});
    }, 300);
}


// function selectCard(selectedCard) {
window.selectCard = function (selectedCard) {
    let cards = document.querySelectorAll(".card");
    cards.forEach(card => card.classList.remove("selected"));
    selectedCard.classList.add("selected");
}

// function changeBeadSelectionContent() {
window.changeBeadSelectionContent = function () {
    // Beads selection state (from cord selection)
    let sidebarBody = document.getElementById('sidebarBody');
    stepHistory.push(sidebarBody.innerHTML);
    sidebarBody.classList.add('hidden');

    setTimeout(() => {

        function renderBead(bead) {
            return `
                <div class="grid-item" onclick="selectGridItem(this, ${bead.id})">
                    <img class="bead-image" src="/img/${bead.img}" alt="${escapeSingleQuotes(bead.name)}">
                    <p class="bead-title">
                        ${escapeSingleQuotes(bead.name)}
                        <span class="fas fa-circle-info info-icon" 
                              onclick="event.stopPropagation(); showToast('${escapeSingleQuotes(bead.name)}', '${escapeSingleQuotes(bead.description)}', '${bead.img}')">
                        </span>
                    </p>
                </div>
            `;
        }
        
        const beadsContent = beadsJSON.beads.map(renderBead).join('');

        sidebarBody.innerHTML = `
            <button class="back-btn" onclick="goBackAndUpdateStep()">&#8592; Back</button>
            <div class="tab-container">
                <div class="tab active" id="beadsTabButton" onclick="showBeads()">Beads</div>
                <div class="tab" id="accessoriesTabButton" onclick="showAccessories()">Accessories</div>
            </div>
            <!-- Filter Button -->
            <div class="search-filter-container">
                <input type="text" class="search-input" placeholder="Search...">
                <button class="filter-btn" onclick="toggleFilterSection()">
                    <i class="fa-solid fa-sliders filter-btn-icon"></i> Filter
                </button>
            </div>

            <!-- Hidden Filter Section -->
            <div id="filterSection" class="filter-container hidden">
    
                <!-- Color Filter -->
                <div class="filter-group">
                    <h4>Color</h4>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="color" value="Red & Pink"> Red & Pink</label>
                        <label><input type="checkbox" name="color" value="Yellow, Orange & Brown"> Yellow, Orange & Brown</label>
                        <label><input type="checkbox" name="color" value="Green"> Green</label>
                        <label><input type="checkbox" name="color" value="Blue"> Blue</label>
                        <label><input type="checkbox" name="color" value="Purple"> Purple</label>
                        <label><input type="checkbox" name="color" value="White & Silver"> White & Silver</label>
                        <label><input type="checkbox" name="color" value="Black"> Black</label>
                        <label><input type="checkbox" name="color" value="Multicolor"> Multicolor</label>
                    </div>
                </div>

                <!-- Size Filter -->
                <div class="filter-group">
                    <h4>Size</h4>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="size" value="6mm"> 6mm</label>
                        <label><input type="checkbox" name="size" value="8mm"> 8mm</label>
                        <label><input type="checkbox" name="size" value="10mm"> 10mm</label>
                        <label><input type="checkbox" name="size" value="12mm"> 12mm</label>
                        <label><input type="checkbox" name="size" value="14mm"> 14mm</label>
                        <label><input type="checkbox" name="size" value="16mm"> 16mm</label>
                        <label><input type="checkbox" name="size" value="18mm"> 18mm</label>
                        <label><input type="checkbox" name="size" value="20mm"> 20mm</label>
                    </div>
                </div>

                <!-- Energy Filter -->
                <div class="filter-group">
                    <h4>Energy</h4>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="energy" value="Wealth & Career"> Wealth & Career</label>
                        <label><input type="checkbox" name="energy" value="Love & Relationships"> Love & Relationships</label>
                        <label><input type="checkbox" name="energy" value="Health & Vitality"> Health & Vitality</label>
                        <label><input type="checkbox" name="energy" value="Calm & Relaxation"> Calm & Relaxation</label>
                        <label><input type="checkbox" name="energy" value="Intuition & Spirituality"> Intuition & Spirituality</label>
                        <label><input type="checkbox" name="energy" value="Protection & Shielding"> Protection & Shielding</label>
                    </div>
                </div>

            </div>
            <div id="beadsContent" class="grid-container">

            `
            + beadsContent +
            `
    
            </div>
            <div id="accessoriesContent" class="grid-container" style="display: none;">
                <p>Accessories content goes here</p>
            </div>
            <div class="toast" id="infoToast">
                <div class="toast-header"> 
                 
                    <img src="/img" alt="Bead Image" class="toast-img" id="toastImg" />
                    <span id="toastTitle" class="toast-title">Toast Title</span>
                    <button class="close-btn" onclick="closeToast()">&times;</button>
                </div>
                <div class="toast-body">
                    <p id="toastMessage">Your message here</p>
                </div>
            </div>

        `;
        sidebarBody.classList.remove('hidden');
        document.querySelector('.back-btn').style.display = 'block';
    }, 300);
}


// function showBeads() {
window.showBeads = function () {
    // Activate the beads tab and show beads content
    document.getElementById('beadsTabButton').classList.add('active');
    document.getElementById('accessoriesTabButton').classList.remove('active');
    document.getElementById('beadsContent').style.display = 'grid';
    document.getElementById('accessoriesContent').style.display = 'none';
}

// function showAccessories() {
window.showAccessories = function () {

    // Activate the accessories tab and show accessories content
    document.getElementById('accessoriesTabButton').classList.add('active');
    document.getElementById('beadsTabButton').classList.remove('active');
    document.getElementById('accessoriesContent').style.display = 'grid';
    document.getElementById('beadsContent').style.display = 'none';
}

window.selectGridItem = function (item, id) {
    addBead(id);

    let gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(it => it.classList.remove('selected'));
    item.classList.add('selected');
}

window.showToast = function (title, message, img) {
    let toast = document.getElementById("infoToast");
    let toastTitle = document.getElementById("toastTitle");
    let toastMessage = document.getElementById("toastMessage");
    let toastImg = document.getElementById("toastImg");

    if (!toast) {
        console.error("Toast element not found!");
        return;
    }

    if (img) {
        toastImg.src = `/img/${img}`;
        toastImg.style.display = "block";
    } else {
        
        
    }
    toastTitle.innerText = title;
    toastMessage.innerHTML = message;
    toast.classList.add("show");
}

// function closeToast() {
window.closeToast = function () {
    let toast = document.getElementById("infoToast");
    toast.classList.remove("show");
}

// function goBackAndUpdateStep() {
window.goBackAndUpdateStep = function () {
    goBack();
    // When going back from beads selection, revert step to cord selection state
    if (currentStep > 0) {
        currentStep = currentStep - 1;
    }
}

// function goBack() {
window.goBack = function () {

    let sidebarBody = document.getElementById('sidebarBody');
    if (stepHistory.length > 0) {
        sidebarBody.classList.add('hidden');
        setTimeout(() => {
            sidebarBody.innerHTML = stepHistory.pop();
            sidebarBody.classList.remove('hidden');
        }, 300);
    }
}

// function handleContinue() {
window.handleContinue = function () {
    // Determine which state to transition to based on the current step.
    if (currentStep === 0) {
        // From Circumference selection to Cord selection
        changeSidebarContent();
        currentStep = 1;
    } else if (currentStep === 1) {
        // From Cord selection to Beads selection
        changeBeadSelectionContent();
        currentStep = 2;
    } else if (currentStep === 2) {
        // Further steps can be added here (e.g., from Beads to next step)
        alert("Next step not implemented yet.");
    }
}

// 
// function toggleFilterSection() {
window.toggleFilterSection = function () {
    let filterSection = document.getElementById('filterSection');
    filterSection.classList.toggle('hidden');
}

// function toggleMobileSidebar() {
window.toggleMobileSidebar = function () {
    const overlaySidebar = document.getElementById("overlaySidebar");
    if (overlaySidebar.classList.contains("open")) {
        overlaySidebar.classList.remove("open");
    } else {
        overlaySidebar.classList.add("open");
    }
}


// function goBackMobile() {
window.goBackMobile = function () {
    if (stepHistory.length > 0) {
        mobileSidebarBody.classList.add('hidden');
        setTimeout(() => {
            mobileSidebarBody.innerHTML = stepHistory.pop();
            mobileSidebarBody.classList.remove('hidden');
        }, 300);
    }
}

// function handleMobileContinue() {
window.handleMobileContinue = function () {
    let mobileSidebarBody = document.getElementById('mobileSidebarBody');
    stepHistory.push(mobileSidebarBody.innerHTML);
    mobileSidebarBody.classList.add('hidden');

    setTimeout(() => {
        if (currentStep === 0) {
            // Move to Cord selection
            mobileSidebarBody.innerHTML = `
                <button class="back-btn" id="backButton" onclick="goBackMobile()">&#8592; Back</button>                
                <p class="sidebar-body-main-heading">Please select the bracelet cord</p>
                <div class="card-container">
                <div class="card" onclick="selectCard(this)">
                    <img src="images/cord1.jpeg" alt="Cord 1">
                    <div class="card-content">
                        <h5>Classic Cord</h5>
                        <div class="color-options">
                            <span style="background: red;"></span>
                            <span style="background: blue;"></span>
                            <span style="background: black;"></span>
                        </div>
                        <p>A durable and stylish cord for everyday wear.</p>
                    </div>
                </div>
                <div class="card" onclick="selectCard(this)">
                    <img src="images/cord1.jpeg" alt="Cord 2">
                    <div class="card-content">
                        <h5>Premium Cord</h5>
                        <div class="color-options">
                            <span style="background: green;"></span>
                            <span style="background: yellow;"></span>
                            <span style="background: white;"></span>
                        </div>
                        <p>Luxurious and elegant, made from high-quality materials.</p>
                    </div>
                </div>
            </div>
            `;
            currentStep = 1;
        } else if (currentStep === 1) {

            function renderBead(bead) {
                return `
                    <div class="grid-item" onclick="selectGridItem(this, ${bead.id})">
                        <img class="bead-image" src="/img/${bead.img}" alt="${escapeSingleQuotes(bead.name)}">
                        <p class="bead-title">
                            ${escapeSingleQuotes(bead.name)}
                            <span class="fas fa-circle-info info-icon" 
                                  onclick="event.stopPropagation(); showToast('${escapeSingleQuotes(bead.name)}', '${escapeSingleQuotes(bead.description)}', '${bead.img}')">
                            </span>
                        </p>
                    </div>
                `;
            }
            
            const beadsContent = beadsJSON.beads.map(renderBead).join('');


            // Move to Beads selection
            mobileSidebarBody.innerHTML = `
            <button class="back-btn" id="backButton" onclick="goBackMobile()">&#8592; Back</button>   
            <div class="tab-container">
                <div class="tab active" id="beadsTabButton" onclick="showBeads()">Beads</div>
                <div class="tab" id="accessoriesTabButton" onclick="showAccessories()">Accessories</div>
            </div>
            <!-- Filter Button -->
            <div class="search-filter-container">
                <input type="text" class="search-input" placeholder="Search...">
                <button class="filter-btn" onclick="toggleFilterSection()">
                    <i class="fa-solid fa-sliders filter-btn-icon"></i> Filter
                </button>
            </div>

            <!-- Hidden Filter Section -->
            <div id="filterSection" class="filter-container hidden">
    
                <!-- Color Filter -->
                <div class="filter-group">
                    <h4>Color</h4>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="color" value="Red & Pink"> Red & Pink</label>
                        <label><input type="checkbox" name="color" value="Yellow, Orange & Brown"> Yellow, Orange & Brown</label>
                        <label><input type="checkbox" name="color" value="Green"> Green</label>
                        <label><input type="checkbox" name="color" value="Blue"> Blue</label>
                        <label><input type="checkbox" name="color" value="Purple"> Purple</label>
                        <label><input type="checkbox" name="color" value="White & Silver"> White & Silver</label>
                        <label><input type="checkbox" name="color" value="Black"> Black</label>
                        <label><input type="checkbox" name="color" value="Multicolor"> Multicolor</label>
                    </div>
                </div>

                <!-- Size Filter -->
                <div class="filter-group">
                    <h4>Size</h4>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="size" value="6mm"> 6mm</label>
                        <label><input type="checkbox" name="size" value="8mm"> 8mm</label>
                        <label><input type="checkbox" name="size" value="10mm"> 10mm</label>
                        <label><input type="checkbox" name="size" value="12mm"> 12mm</label>
                        <label><input type="checkbox" name="size" value="14mm"> 14mm</label>
                        <label><input type="checkbox" name="size" value="16mm"> 16mm</label>
                        <label><input type="checkbox" name="size" value="18mm"> 18mm</label>
                        <label><input type="checkbox" name="size" value="20mm"> 20mm</label>
                    </div>
                </div>

                <!-- Energy Filter -->
                <div class="filter-group">
                    <h4>Energy</h4>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="energy" value="Wealth & Career"> Wealth & Career</label>
                        <label><input type="checkbox" name="energy" value="Love & Relationships"> Love & Relationships</label>
                        <label><input type="checkbox" name="energy" value="Health & Vitality"> Health & Vitality</label>
                        <label><input type="checkbox" name="energy" value="Calm & Relaxation"> Calm & Relaxation</label>
                        <label><input type="checkbox" name="energy" value="Intuition & Spirituality"> Intuition & Spirituality</label>
                        <label><input type="checkbox" name="energy" value="Protection & Shielding"> Protection & Shielding</label>
                    </div>
                </div>

            </div>
         
            <div id="beadsContent" class="grid-container">
               `
                + beadsContent +


                `
       
            </div>
            <div id="accessoriesContent" class="grid-container" style="display: none;">
                <p>Accessories content goes here</p>
            </div>           
                  <div class="toast" id="infoToast">
                <div class="toast-header"> 
                 
                    <img src="/img" alt="Bead Image" class="toast-img" id="toastImg" />
                    <span id="toastTitle" class="toast-title">Toast Title</span>
                    <button class="close-btn" onclick="closeToast()">&times;</button>
                </div>
                <div class="toast-body">
                    <p id="toastMessage">Your message here</p>
                </div>
            </div> 
            `;
            currentStep = 2;
        } else {
            alert("Next step not implemented yet.");
        }
        mobileSidebarBody.classList.remove('hidden');
        document.querySelector('.back-btn').style.display = 'block';
    }, 300);
}





