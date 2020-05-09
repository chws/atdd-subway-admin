import {listItemTemplate, optionTemplate, subwayLinesItemTemplate} from "../../utils/templates.js";
import tns from "../../lib/slider/tiny-slider.js";
import {EVENT_TYPE} from "../../utils/constants.js";
import Modal from "../../ui/Modal.js";
import api from "../../api/index.js";

function AdminEdge() {
    const $selectOptions = document.querySelector("#station-select-options");
    const $departStationInput = document.querySelector("#depart-station-name");
    const $arrivalStationInput = document.querySelector("#arrival-station-name");
    const $subwayLinesSlider = document.querySelector(".subway-lines-slider");
    const $submitEdgeBtn = document.querySelector("#submit-button");

    const createSubwayEdgeModal = new Modal();

    const resetModalInputValue = () => {
        $departStationInput.value = "";
        $arrivalStationInput.value = "";
    };

    const getStationIdBy = stationName => {
        let stationId;
        api.station.get()
            .then(stations => {
                stationId = stations
                    .filter(station => station.name === stationName)
                    .map(station => station.id)[0];
            })
        return stationId;
    };


    const onAddLineStationHandler = event => {
        event.preventDefault();
        const newEdge = {
            preStationId: getStationIdBy($departStationInput.value),
            stationId: getStationIdBy($arrivalStationInput.value)
        };

        const lineId = $selectOptions.options[$selectOptions.selectedIndex].dataset.lineId;
        const $edgeList = document.querySelector(`#subway-edge-list-${lineId}`)
        api.line.create(newEdge)
            .then(() => {
                $edgeList.insertAdjacentHTML(
                    "beforeend",
                    listItemTemplate
                )
            })
            .catch(error => console.log(error));

        createSubwayEdgeModal.toggle();
        resetModalInputValue();
    }

    const initSubwayLinesSlider = () => {
        api.line.get()
            .then(data => data.json())
            .then(lines => {
                $subwayLinesSlider.innerHTML = lines
                    .map(line => subwayLinesItemTemplate(line))
                    .join("");

                tns({
                    container: ".subway-lines-slider",
                    loop: true,
                    slideBy: "page",
                    speed: 400,
                    autoplayButtonOutput: false,
                    mouseDrag: true,
                    lazyload: true,
                    controlsContainer: "#slider-controls",
                    items: 1,
                    edgePadding: 25
                });
            })
    };

    const initSubwayLineOptions = () => {
        api.line.get()
            .then(data => data.json())
            .then(lines => {
                const subwayLineOptionTemplate = lines
                    .map(line => optionTemplate(line))
                    .join("");
                const $stationSelectOptions = document.querySelector(
                    "#station-select-options"
                );
                $stationSelectOptions.insertAdjacentHTML(
                    "afterbegin",
                    subwayLineOptionTemplate
                );
            })
    };

    const onRemoveStationHandler = event => {
        const $target = event.target;
        const isDeleteButton = $target.classList.contains("mdi-delete");
        if (isDeleteButton) {
            $target.closest(".list-item").remove();
        }
    };

    const initEventListeners = () => {
        $subwayLinesSlider.addEventListener(
            EVENT_TYPE.CLICK,
            onRemoveStationHandler
        );
        $submitEdgeBtn.addEventListener(EVENT_TYPE.CLICK, onAddLineStationHandler);
    };

    this.init = () => {
        initSubwayLinesSlider();
        initSubwayLineOptions();
        initEventListeners();
    };
}

const adminEdge = new AdminEdge();
adminEdge.init();
