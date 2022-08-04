/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";
import store from "../app/Store.js";

jest.mock("../app/store", () => mockStore);

const onNavigate = (pathname) =>
  (document.body.innerHTML = ROUTES({ pathname }));

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => new Date(b.date) - new Date(a.date);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test("then, when i click on the icon-eye the modal with the justificatif should display", () => {
      const html = (document.body.innerHTML = BillsUI({ data: bills })); // remplis le DOM de la page bill avec les données
      document.body.innerHTML = html;
      const bill = new Bills({
        //récupère les paramètres document et onNavigate dans la variable bill
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      $.fn.modal = jest.fn();
      const btnIconEye = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(() =>
        bill.handleClickIconEye(btnIconEye)
      );
      expect(btnIconEye).toBeTruthy();
      btnIconEye.addEventListener("click", handleClickIconEye);
      userEvent.click(btnIconEye);
      expect(handleClickIconEye).toHaveBeenCalled();
      expect(screen.getByText("Justificatif")).toBeVisible();
    });
    test("then, newBill page should be render when i click on newBill ", () => {
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" })); // Je remplis le local storage avec les données correspondante
      const html = (document.body.innerHTML = BillsUI({ data: bills })); // remplis le DOM de la page bill avec les données
      document.body.innerHTML = html;

      const bill = new Bills({
        //récupère les paramètres document et onNavigate dans la variable bill
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const handleClickNewBill = jest.fn(bill.handleClickNewBill);
      const bntnNewBill = screen.getByTestId("btn-new-bill");
      expect(bntnNewBill).toBeTruthy();
      bntnNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(bntnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
});

describe("Given I am on Bills page page and i get an error message", () => {
  test("Then, Error page should be rendered", () => {
    document.body.innerHTML = BillsUI({ error: "some error message" });
    expect(screen.getAllByText("Erreur")).toBeTruthy();
  });
});
describe("When I am on Bills page and the page still loading", () => {
  test("Then, Loading page should be rendered", () => {
    document.body.innerHTML = BillsUI({ loading: true });
    expect(screen.getAllByText("Loading...")).toBeTruthy();
  });
});

//GET

describe("Given I am a user connected as an employee", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "employee@test.tld" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      const getSpy = jest.spyOn(mockStore, "bills");
      const bills = mockStore.bills();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect((await bills.list()).length).toBe(4);
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "employee@test.tld",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
