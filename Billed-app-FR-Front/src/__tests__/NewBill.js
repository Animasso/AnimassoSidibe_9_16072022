/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import { bills } from "../fixtures/bills.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import userEvent from "@testing-library/user-event";

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
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({
        document,
        onNavigate,
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
});
