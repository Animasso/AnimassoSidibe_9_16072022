/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be present", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const BillForm = screen.getByTestId("form-new-bill");
      expect(BillForm).toBeTruthy();
    });
    test("Then mail icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcom = screen.getByTestId("icon-mail");
      expect(mailIcom).toHaveClass("active-icon");
    });
    test("then all the imputs should be present", () => {
      const expenseTypeInput = screen.queryAllByText("expense-type");
      expect(expenseTypeInput).toBeTruthy();

      const expenseNameInput = screen.queryAllByText("expense-name");
      expect(expenseNameInput).toBeTruthy();

      const datePicker = screen.queryAllByText("datepicker");
      expect(datePicker).toBeTruthy();

      const amountInput = screen.queryAllByText("amount");
      expect(amountInput).toBeTruthy();

      const vatInput = screen.queryAllByText("vat");
      expect(vatInput).toBeTruthy();

      const pctInput = screen.queryAllByText("pct");
      expect(pctInput).toBeTruthy();

      const commentary = screen.queryAllByText("commentary");
      expect(commentary).toBeTruthy();

      const fileInput = screen.queryAllByText("file");
      expect(fileInput).toBeTruthy();
    });
  });
  describe("When I add the right type of image file as justificatif ", () => {
    test("Then this new file should have been changed in the input", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(() => newBills.handleChangeFile);
      const fileInput = screen.getByTestId("file");

      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["image.png"], "image.png", { type: "image/png" })],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("image.png");
    });
  });
  describe("When I add the wrong type of image file as justificatif ", () => {
    test("Then an error message should diplay", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(() => newBills.handleChangeFile);
      const fileInput = screen.getByTestId("file");

      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["image.pdf"], "image.pdf", { type: "image.pdf" })],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("image.pdf");
      expect(
        screen.getByText(
          "Veuiilez charger un fichier avec les extentions png,jpg ou jpeg"
        )
      ).toBeTruthy();
    });
  });
  describe("when i click on the send button ", () => {
    test("the form should be send and i bills page should be render", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const handleSubmit = jest.fn((e) => newBills.handleSubmit);
      const newBillForm = screen.getByTestId("form-new-bill");
      newBillForm.addEventListener("submit", handleSubmit);

      fireEvent.submit(newBillForm);

      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
  describe("Given that i fiil the new bill form and i click send", () => {
    test("a new form should be POST", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tdl",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const formInput = {
        id: "jvijfoijjgfhoi",
        status: "refused",
        pct: 20,
        amount: 100,
        email: "employee@test.tld",
        name: "test5",
        vat: 80,
        fileName: "image.jpg",
        date: "2022-08-05",
        commentary: "blabla",
        type: "Restaurants et bars",
        fileUrl: "https://image.jpg",
      };

      screen.getByTestId("expense-type").value = formInput.type;
      screen.getByTestId("expense-name").value = formInput.name;
      screen.getByTestId("datepicker").value = formInput.date;
      screen.getByTestId("amount").value = formInput.amount;
      screen.getByTestId("vat").value = formInput.vat;
      screen.getByTestId("pct").value = formInput.pct;
      screen.getByTestId("commentary").value = formInput.commentary;

      newBill.fileName = formInput.fileName;
      newBill.fileUrl = formInput.fileUrl;
      const spy = jest.spyOn(mockStore, "bills");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      const bills = mockStore.bills(newBill);
      expect(spy).toHaveBeenCalled();
      expect((await bills.list()).length).toBe(4);
    });
  });
});
